"""
Campus Activity Location Prediction Pipeline (Generalized & Probabilistic)
========================================================================
Features added compared to previous version:
 - Temporal generalization: uses nearby time-windows with exponential decay
 - Probabilistic cluster x time-window -> location distributions
 - Fallbacks: cluster-level priors and global priors when data is sparse
 - Confidence scores are true probabilities (0..1)
 - Keeps 'source' for transparency (not used in clustering)
 - Configurable parameters for window size, decay, and clustering
Dependencies: pandas, numpy, scikit-learn
"""
import os
import pandas as pd
import numpy as np
from pathlib import Path
from datetime import timedelta
from typing import Dict, Tuple, Optional, List
from sklearn.preprocessing import LabelEncoder
from sklearn.cluster import KMeans
import warnings
warnings.filterwarnings("ignore")


class CampusLocationPredictor:
    def __init__(
        self,
        data_dir: str = "data",
        time_window_hours: int = 2,
        n_clusters: Optional[int] = None,
        decay_half_life_hours: float = 2.0,
        nearby_window_radius: int = 2,
    ):
        """
        Args:
            data_dir: path with CSV files (see load function for expected names)
            time_window_hours: size of the aggregation window (k hours)
            n_clusters: if None auto-select (based on entity count)
            decay_half_life_hours: half-life for exponential time-decay weighting (hours)
            nearby_window_radius: how many windows to search on each side (integer)
        """
        self.data_dir = Path(data_dir)
        self.time_window_hours = int(time_window_hours)
        self.n_clusters = n_clusters
        self.decay_half_life_hours = float(decay_half_life_hours)
        self.nearby_window_radius = int(nearby_window_radius)

        # Data containers
        self.merged_data: pd.DataFrame = pd.DataFrame()
        self.aggregated_data: pd.DataFrame = pd.DataFrame()
        self.feature_matrix: pd.DataFrame = pd.DataFrame()
        self.location_encoder = LabelEncoder()
        self.entity_encoder = LabelEncoder()
        self.kmeans_model = None
        self.entity_clusters: Dict[str, int] = {}
        self.cluster_prob_table: pd.DataFrame = pd.DataFrame()
        self.global_location_prior: pd.Series = pd.Series()

    # -----------------------------
    # Loading & integration
    # -----------------------------
    def load_and_integrate_data(self):
      """Load multiple CSVs and integrate them into unified schema."""
      print("=== STEP 1: Load & Integrate Data ===")

      def try_read(filename):
          path = os.path.join(self.data_dir, filename)
          if os.path.exists(path):
              print(f"Reading {filename}")
              return pd.read_csv(path)
          return None

      dfs = []

      # ---- NOTES ----
      df = try_read("free_text_notes (helpdesk or RSVPs).csv")
      if df is None:
          df = try_read("notes.csv")
      if df is not None and 'timestamp' in df.columns and 'entity_id' in df.columns:
          df = df[['entity_id', 'timestamp']].copy()
          df['location_id'] = 'note_location'
          df['source'] = 'note'
          df['temp_id'] = df['entity_id']
          dfs.append(df[['temp_id', 'timestamp', 'location_id', 'source']])

      # ---- WIFI/DEVICES ----
      df = try_read("wifi_associations_logs.csv")
      if df is None:
          df = try_read("devices.csv")
      if df is None:
          df = try_read("device_logs.csv")
      if df is not None and 'timestamp' in df.columns and 'device_hash' in df.columns:
          df = df.rename(columns={'ap_id': 'location_id'})
          df['source'] = 'device'
          df['temp_id'] = df['device_hash']
          dfs.append(df[['temp_id', 'timestamp', 'location_id', 'source']])

      # ---- BOOKINGS ----
      df = try_read("lab_bookings.csv")
      if df is None:
          df = try_read("bookings.csv")
      if df is not None and 'entity_id' in df.columns:
          df = df.rename(columns={'room_id': 'location_id', 'start_time': 'timestamp'})
          df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
          df['source'] = 'booking'
          df['temp_id'] = df['entity_id']
          dfs.append(df[['temp_id', 'timestamp', 'location_id', 'source']].dropna(subset=['timestamp']))

      # ---- FRAMES ----
      df = try_read("cctv_frames.csv")
      if df is None:
          df = try_read("frames.csv")
      if df is not None and 'timestamp' in df.columns and 'face_id' in df.columns:
          df['source'] = 'frame'
          df['temp_id'] = df['face_id']
          dfs.append(df[['temp_id', 'timestamp', 'location_id', 'source']])

      # ---- CARDS ----
      df = try_read("campus card_swipes.csv")
      if df is None:
          df = try_read("cards.csv")
      if df is None:
          df = try_read("card_swipes.csv")
      if df is not None and 'timestamp' in df.columns and 'card_id' in df.columns:
          df['source'] = 'card'
          df['temp_id'] = df['card_id']
          dfs.append(df[['temp_id', 'timestamp', 'location_id', 'source']])

      # ---- LIBRARY ----
      df = try_read("library_checkouts.csv")
      if df is None:
          df = try_read("library_checkout.csv")
      if df is None:
          df = try_read("checkout.csv")
      if df is not None and 'timestamp' in df.columns and 'entity_id' in df.columns:
          df['location_id'] = 'library'
          df['source'] = 'library'
          df['temp_id'] = df['entity_id']
          dfs.append(df[['temp_id', 'timestamp', 'location_id', 'source']])

      # ---- Merge ----
      if not dfs:
          raise ValueError("No data files found in directory!")

      merged = pd.concat(dfs, ignore_index=True)
      merged['timestamp'] = pd.to_datetime(merged['timestamp'], errors='coerce')
      merged = merged.dropna(subset=['timestamp'])
      print(f"Concatenated {len(merged)} total records from {len(dfs)} sources")

      # Load profiles to map identifiers to entity_id
      profiles_file = try_read("student or staff profiles.csv")
      if profiles_file is None:
          profiles_file = try_read("profiles.csv")
      
      # Initialize entity_id column
      merged['entity_id'] = None
      
      if profiles_file is not None:
          print("Loading profiles for ID mapping...")
          # Create mapping dictionaries - handle all possible ID types
          card_to_entity = {}
          device_to_entity = {}
          face_to_entity = {}
          entity_to_entity = {}
          
          if 'card_id' in profiles_file.columns:
              card_to_entity = dict(zip(profiles_file['card_id'].dropna(), 
                                       profiles_file.loc[profiles_file['card_id'].notna(), 'entity_id']))
          if 'device_hash' in profiles_file.columns:
              device_to_entity = dict(zip(profiles_file['device_hash'].dropna(), 
                                         profiles_file.loc[profiles_file['device_hash'].notna(), 'entity_id']))
          if 'face_id' in profiles_file.columns:
              face_to_entity = dict(zip(profiles_file['face_id'].dropna(), 
                                       profiles_file.loc[profiles_file['face_id'].notna(), 'entity_id']))
          if 'entity_id' in profiles_file.columns:
              entity_to_entity = dict(zip(profiles_file['entity_id'].dropna(), 
                                         profiles_file['entity_id'].dropna()))
          
          # Create unified mapping based on source type
          def map_to_entity(row):
              temp_id = row['temp_id']
              source = row['source']
              
              if pd.isna(temp_id):
                  return None
              
              # Try direct entity_id first
              if temp_id in entity_to_entity:
                  return entity_to_entity[temp_id]
              
              # Map based on source
              if source == 'card' and temp_id in card_to_entity:
                  return card_to_entity[temp_id]
              elif source == 'device' and temp_id in device_to_entity:
                  return device_to_entity[temp_id]
              elif source == 'frame' and temp_id in face_to_entity:
                  return face_to_entity[temp_id]
              elif source in ['booking', 'library', 'note']:
                  # These already have entity_id
                  return temp_id
              
              return None
          
          merged['entity_id'] = merged.apply(map_to_entity, axis=1)
      else:
          print("Warning: No profiles file found. Using temp_id as entity_id where source is 'booking', 'library', or 'note'")
          # Fallback: use temp_id for sources that already have entity_id
          mask = merged['source'].isin(['booking', 'library', 'note'])
          merged.loc[mask, 'entity_id'] = merged.loc[mask, 'temp_id']
      
      # Drop records without entity_id
      before_count = len(merged)
      merged = merged.dropna(subset=['entity_id'])
      after_count = len(merged)
      print(f"Mapped {after_count}/{before_count} records to entity_id ({100*after_count/before_count:.1f}%)")
      
      # Keep only necessary columns
      merged = merged[['entity_id', 'timestamp', 'location_id', 'source']]
      merged['location_id'] = merged['location_id'].astype(str)
      
      self.merged_data = merged
      print(f"Loaded {len(self.merged_data):,} records from {len(dfs)} data sources.")
      return merged

    # -----------------------------
    # Temporal aggregation
    # -----------------------------
    def temporal_aggregation(self) -> pd.DataFrame:
        """
        Group events into fixed time windows and select the dominant location per entity-window.
        """
        print("\n=== STEP 2: Temporal Aggregation ===")
        df = self.merged_data.copy()
        df['time_window'] = df['timestamp'].dt.floor(f"{self.time_window_hours}H")

        # For each entity/time_window choose the mode location (if tie pick first)
        aggregated = df.groupby(['entity_id', 'time_window']).agg(
            location_id=('location_id', lambda x: x.mode().iloc[0] if len(x.mode()) > 0 else x.iloc[0]),
            sources=('source', lambda s: ",".join(sorted(set(s)))),
            event_count=('timestamp', 'count'),
        ).reset_index()

        self.aggregated_data = aggregated
        print(f"Aggregated rows (entity x window): {len(aggregated)} | windows: {aggregated['time_window'].nunique()}")
        return aggregated

    # -----------------------------
    # Feature matrix & clustering
    # -----------------------------
    def build_feature_matrix_and_cluster(self):
        """
        Create a feature matrix (entity x time_window) that holds location ids (encoded),
        then run clustering on entities to obtain entity_clusters.
        """
        print("\n=== STEP 3: Build Features & Cluster Entities ===")
        df = self.aggregated_data.copy()

        # Encode locations (for pivoting)
        df['location_encoded'] = self.location_encoder.fit_transform(df['location_id'].astype(str))

        # pivot: rows=entity_id, cols=time_window, values=location_encoded
        pivot = df.pivot_table(index='entity_id', columns='time_window', values='location_encoded', aggfunc='first')
        # Keep columns sorted
        pivot = pivot.reindex(sorted(pivot.columns), axis=1)
        # Fill missing with -1 to indicate absence
        pivot = pivot.fillna(-1)

        self.feature_matrix = pivot  # DataFrame (index entity_id)
        print(f"Feature matrix shape: {pivot.shape} (entities x windows)")

        # clustering
        X = pivot.values
        n_entities = X.shape[0]
        if self.n_clusters is None:
            # heuristics: #clusters = min( max(3, n_entities//12), 20)
            suggested = max(3, min(20, max(3, n_entities // 12)))
            n_clusters = suggested
        else:
            n_clusters = self.n_clusters

        print(f"Clustering into {n_clusters} clusters (KMeans)")
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        labels = kmeans.fit_predict(X)
        self.kmeans_model = kmeans

        # entity -> cluster map
        entity_ids = list(pivot.index)
        self.entity_clusters = dict(zip(entity_ids, labels))
        print("Cluster distribution:")
        unique, counts = np.unique(labels, return_counts=True)
        for u, c in zip(unique, counts):
            print(f" - Cluster {u}: {c} entities")

        return self.entity_clusters

    # -----------------------------
    # Build probabilistic cluster x time -> location table
    # -----------------------------
    def build_cluster_prob_table(self):
        """
        After clustering is available, compute p(location | cluster, time_window)
        as normalized counts. Also compute cluster priors and global prior.
        """
        print("\n=== STEP 4: Build Probabilistic Tables ===")
        if not self.entity_clusters:
            raise RuntimeError("Entities not clustered yet. Call build_feature_matrix_and_cluster() first.")

        agg = self.aggregated_data.copy()
        # map cluster
        agg['cluster'] = agg['entity_id'].map(self.entity_clusters)

        # counts per (cluster, time_window, location)
        count_tbl = agg.groupby(['cluster', 'time_window', 'location_id']).size().reset_index(name='count')

        # normalize per (cluster, time_window)
        prob_tbl = count_tbl.groupby(['cluster', 'time_window']).apply(
            lambda g: g.assign(prob=g['count'] / g['count'].sum())
        ).reset_index(drop=True)

        self.cluster_prob_table = prob_tbl[['cluster', 'time_window', 'location_id', 'prob']]

        # cluster-level prior (ignoring time)
        cluster_prior = agg.groupby(['cluster', 'location_id']).size().reset_index(name='count')
        cluster_prior = cluster_prior.groupby('cluster').apply(lambda g: g.assign(prob=g['count'] / g['count'].sum())).reset_index(drop=True)
        self.cluster_prior = cluster_prior[['cluster', 'location_id', 'prob']]

        # global prior
        global_counts = agg['location_id'].value_counts(normalize=True)
        self.global_location_prior = global_counts  # Series indexed by location_id

        print("Built cluster x time x location probability table")
        print(f" - Rows in prob table: {len(self.cluster_prob_table)}")
        print(f" - Cluster priors: {len(self.cluster_prior)}")
        print(f" - Global locations: {len(self.global_location_prior)}")

    # -----------------------------
    # Utility: nearby windows & decay
    # -----------------------------
    def _nearby_windows(self, target: pd.Timestamp) -> List[pd.Timestamp]:
        """
        Returns list of nearby time_window timestamps within radius self.nearby_window_radius
        centered at target, restricted to windows observed in data (so we do not invent windows).
        """
        observed = sorted(self.cluster_prob_table['time_window'].unique()) if not self.cluster_prob_table.empty else sorted(self.aggregated_data['time_window'].unique())
        if len(observed) == 0:
            return []
        # generate candidate windows by shifting target by multiples of time_window_hours
        windows = []
        for r in range(-self.nearby_window_radius, self.nearby_window_radius + 1):
            w = target + pd.Timedelta(hours=r * self.time_window_hours)
            # include if w is close to an observed window (exact match on floor representation)
            # we only include if w exists in observed windows (avoid predicting outside observed schedule)
            if w in observed:
                windows.append(w)
        return windows

    def _decay_weight(self, hours_diff: float) -> float:
        """
        Exponential decay weight based on hours difference.
        We express decay via half-life: w = 0.5 ** (hours_diff / half_life)
        """
        h = abs(float(hours_diff))
        if self.decay_half_life_hours <= 0:
            return 1.0 if h == 0 else 0.0
        return 0.5 ** (h / self.decay_half_life_hours)

    # -----------------------------
    # Prediction API
    # -----------------------------
    def predict_location(self, entity_id: str, timestamp: str) -> Dict:
        """
        Predict probable location for a given entity and timestamp.
        Returns dict with keys:
          - predicted_location (str or None)
          - confidence (float 0..1)
          - cluster (int or -1)
          - method (str): 'actual_data', 'probabilistic_generalization', 'cluster_prior', 'global_prior', 'entity_not_found', 'no_data'
          - details: optional extra info
        """
        ts = pd.to_datetime(timestamp)
        time_window = ts.floor(f"{self.time_window_hours}H")

        # 1) If entity has actual data in that window -> return actual w/ confidence 1.0
        existing = self.aggregated_data[
            (self.aggregated_data['entity_id'] == entity_id) & (self.aggregated_data['time_window'] == time_window)
        ]
        if len(existing) > 0:
            actual_loc = existing.iloc[0]['location_id']
            return {'predicted_location': actual_loc, 'confidence': 1.0, 'cluster': self.entity_clusters.get(entity_id, -1), 'method': 'actual_data', 'details': {'source': existing.iloc[0]['sources']}}

        # 2) If entity not in cluster map -> handle
        cluster_id = self.entity_clusters.get(entity_id)
        if cluster_id is None:
            return {'predicted_location': None, 'confidence': 0.0, 'cluster': -1, 'method': 'entity_not_found', 'details': {}}

        # 3) Look up exact (cluster, time_window) distribution
        probs = self.cluster_prob_table[
            (self.cluster_prob_table['cluster'] == cluster_id) &
            (self.cluster_prob_table['time_window'] == time_window)
        ].copy()

        # 4) If no exact data, aggregate nearby windows with decay
        if probs.empty:
            nearby = self._nearby_windows(time_window)
            if len(nearby) == 0:
                probs = pd.DataFrame()  # remain empty
            else:
                parts = []
                for w in nearby:
                    sub = self.cluster_prob_table[
                        (self.cluster_prob_table['cluster'] == cluster_id) &
                        (self.cluster_prob_table['time_window'] == w)
                    ].copy()
                    if sub.empty:
                        continue
                    hours_diff = (w - time_window).total_seconds() / 3600.0
                    weight = self._decay_weight(hours_diff)
                    sub['weighted_prob'] = sub['prob'] * weight
                    parts.append(sub[['location_id', 'weighted_prob']])
                if len(parts) > 0:
                    all_parts = pd.concat(parts, ignore_index=True)
                    agg = all_parts.groupby('location_id')['weighted_prob'].sum().reset_index(name='score')
                    total = agg['score'].sum()
                    if total > 0:
                        agg['prob'] = agg['score'] / total
                    else:
                        agg['prob'] = 0.0
                    probs = agg[['location_id', 'prob']].copy()
                else:
                    probs = pd.DataFrame()

        # 5) If we obtained probability estimates, pick top
        if (not probs.empty) and ('prob' in probs.columns):
            # Normalize just in case
            probs = probs.groupby('location_id', as_index=False)['prob'].sum()
            if probs['prob'].sum() > 0:
                probs['prob'] = probs['prob'] / probs['prob'].sum()
            probs = probs.sort_values('prob', ascending=False).reset_index(drop=True)
            top = probs.iloc[0]
            return {
                'predicted_location': top['location_id'],
                'confidence': float(top['prob']),
                'cluster': cluster_id,
                'method': 'probabilistic_generalization',
                'details': {'considered_windows': self._nearby_windows(time_window)}
            }

        # 6) fallback to cluster-level prior (no time)
        cp = self.cluster_prior[self.cluster_prior['cluster'] == cluster_id].copy()
        if len(cp) > 0:
            cp = cp.sort_values('prob', ascending=False).reset_index(drop=True)
            top = cp.iloc[0]
            return {'predicted_location': top['location_id'], 'confidence': float(top['prob']), 'cluster': cluster_id, 'method': 'cluster_prior', 'details': {}}

        # 7) fallback to global prior
        if len(self.global_location_prior) > 0:
            top_loc = self.global_location_prior.index[0]
            top_prob = float(self.global_location_prior.iloc[0])
            return {'predicted_location': top_loc, 'confidence': top_prob * 0.5, 'cluster': cluster_id, 'method': 'global_prior', 'details': {}}

        # 8) give up
        return {'predicted_location': None, 'confidence': 0.0, 'cluster': cluster_id, 'method': 'no_data', 'details': {}}

    # -----------------------------
    # Bulk predictions generation
    # -----------------------------
    def generate_predictions_for_all(self, restrict_to_windows: Optional[List[pd.Timestamp]] = None) -> pd.DataFrame:
        """
        Produce predictions for all entity x time_window combinations where we don't have actual data.
        If restrict_to_windows is provided, only predict for those windows.
        """
        print("\n=== STEP 5: Bulk Predictions ===")
        all_windows = sorted(self.aggregated_data['time_window'].unique())
        if restrict_to_windows is not None:
            windows = sorted([pd.to_datetime(w) for w in restrict_to_windows if pd.to_datetime(w) in all_windows])
        else:
            windows = all_windows

        entities = list(self.entity_clusters.keys())
        existing_pairs = set(zip(self.aggregated_data['entity_id'], self.aggregated_data['time_window']))

        preds = []
        for ent in entities:
            for w in windows:
                if (ent, w) in existing_pairs:
                    continue
                r = self.predict_location(ent, w.isoformat())
                preds.append({
                    'entity_id': ent,
                    'time_window': w,
                    'predicted_location': r['predicted_location'],
                    'confidence': r['confidence'],
                    'cluster': r['cluster'],
                    'method': r['method']
                })
        df = pd.DataFrame(preds)
        print(f"Generated {len(df)} predictions")
        return df

    # -----------------------------
    # Reporting & saving
    # -----------------------------
    def print_cluster_summary(self, top_n_locations: int = 5):
        print("\n=== CLUSTER SUMMARY ===")
        for cluster in sorted(set(self.entity_clusters.values())):
            members = [eid for eid, c in self.entity_clusters.items() if c == cluster]
            cluster_rows = self.aggregated_data[self.aggregated_data['entity_id'].isin(members)]
            total_events = cluster_rows['event_count'].sum() if 'event_count' in cluster_rows.columns else len(cluster_rows)
            top_locations = cluster_rows['location_id'].value_counts().head(top_n_locations)
            print(f"\nCluster {cluster}: members={len(members)} | events={total_events}")
            print(" Top locations:")
            for loc, cnt in top_locations.items():
                print(f"  - {loc}: {cnt}")

    def save_all(self, out_dir: str = "output", save_predictions: bool = True):
        p = Path(out_dir)
        p.mkdir(parents=True, exist_ok=True)
        self.merged_data.to_csv(p / "merged_data.csv", index=False)
        self.aggregated_data.to_csv(p / "aggregated_data.csv", index=False)
        pd.DataFrame([{'entity_id': e, 'cluster': c} for e, c in self.entity_clusters.items()]).to_csv(p / "cluster_assignments.csv", index=False)
        self.cluster_prob_table.to_csv(p / "cluster_prob_table.csv", index=False)
        if save_predictions:
            preds = self.generate_predictions_for_all()
            preds.to_csv(p / "predicted_locations.csv", index=False)
        print(f"Saved outputs to {p.resolve()}")


# -----------------------------
# Example CLI runner
# -----------------------------
def main():
    print("\n=== Campus Location Prediction (Generalized) ===\n")
    # configuration (can be changed interactively)
    data_dir = input("Data directory (default 'data'): ").strip() or "data"
    try:
        k = int(input("Time window hours k (default 2): ").strip() or 2)
    except Exception:
        k = 2
    try:
        half_life = float(input("Decay half-life in hours (default 2.0): ").strip() or 2.0)
    except Exception:
        half_life = 2.0
    try:
        radius = int(input("Nearby window radius (default 2): ").strip() or 2)
    except Exception:
        radius = 2
    try:
        ncl = input("Number of clusters (enter for auto): ").strip()
        ncl = int(ncl) if ncl else None
    except Exception:
        ncl = None

    predictor = CampusLocationPredictor(
        data_dir=data_dir,
        time_window_hours=k,
        n_clusters=ncl,
        decay_half_life_hours=half_life,
        nearby_window_radius=radius
    )

    # Run pipeline
    predictor.load_and_integrate_data()
    predictor.temporal_aggregation()
    predictor.build_feature_matrix_and_cluster()
    predictor.build_cluster_prob_table()
    predictor.print_cluster_summary()

    # Save results
    save_all = input("Save outputs and generate bulk predictions? (y/N): ").strip().lower() == 'y'
    predictor.save_all(save_predictions=save_all)

    # interactive mode
    print("\n=== Interactive Query Mode === (type 'quit' to exit)\n")
    while True:
        ent = input("Enter entity_id (or 'quit'): ").strip()
        if ent.lower() in ('quit', 'exit'):
            break
        ts = input("Enter timestamp (YYYY-MM-DD HH:MM:SS): ").strip()
        try:
            r = predictor.predict_location(ent, ts)
            print(f"\nResult for {ent} @ {ts}:")
            print(f" - Predicted location: {r['predicted_location']}")
            print(f" - Confidence: {r['confidence']:.2%}")
            print(f" - Cluster: {r['cluster']}")
            print(f" - Method: {r['method']}")
            if 'details' in r and r['details']:
                print(f" - Details: {r['details']}")
        except Exception as e:
            print(f"Error: {e}")

    print("\nExiting. Goodbye.")


if __name__ == "__main__":
    main()
