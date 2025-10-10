// Register user
export const registerUser = async (userData) => {
  const response = await fetch(`http://localhost:5000/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // to send/receive cookies
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

// Login user
export const loginUser = async (userData) => {
  const response = await fetch(`http://localhost:5000/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // to send/receive cookies
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};
