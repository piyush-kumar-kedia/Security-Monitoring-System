"""Quick test of prediction_pipeline.py fixes"""
from prediction_pipeline import CampusLocationPredictor

print("=" * 70)
print("TESTING FIXED PREDICTION_PIPELINE.PY")
print("=" * 70)

try:
    # Initialize
    print("\n1. Initializing predictor...")
    p = CampusLocationPredictor(data_dir='data', time_window_hours=2)
    print("   ✅ Predictor created")
    
    # Load data
    print("\n2. Loading and integrating data...")
    p.load_and_integrate_data()
    print(f"   ✅ Loaded {len(p.merged_data):,} records")
    
    # Temporal aggregation
    print("\n3. Temporal aggregation...")
    p.temporal_aggregation()
    print(f"   ✅ Created {len(p.aggregated_data):,} aggregations")
    
    # Build features and cluster
    print("\n4. Building features and clustering...")
    p.build_feature_matrix_and_cluster()
    print(f"   ✅ Clustered {len(p.entity_clusters)} entities into {len(set(p.entity_clusters.values()))} clusters")
    
    # Build probability tables
    print("\n5. Building probability tables...")
    p.build_cluster_prob_table()
    print(f"   ✅ Built probability table with {len(p.cluster_prob_table)} entries")
    
    # Test prediction
    print("\n6. Testing prediction...")
    sample_entity = list(p.entity_clusters.keys())[0]
    sample_time = str(p.aggregated_data['time_window'].iloc[0])
    result = p.predict_location(sample_entity, sample_time)
    print(f"   ✅ Prediction: {result['predicted_location']} (confidence: {result['confidence']:.2%})")
    
    print("\n" + "=" * 70)
    print("✅ ALL TESTS PASSED!")
    print("=" * 70)
    print("\nSummary:")
    print(f"  - Total records: {len(p.merged_data):,}")
    print(f"  - Unique entities: {len(p.entity_clusters)}")
    print(f"  - Time windows: {p.aggregated_data['time_window'].nunique()}")
    print(f"  - Clusters: {len(set(p.entity_clusters.values()))}")
    print(f"  - Unique locations: {p.merged_data['location_id'].nunique()}")
    
except Exception as e:
    print(f"\n❌ TEST FAILED: {e}")
    import traceback
    traceback.print_exc()
