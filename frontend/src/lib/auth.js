// Simple auth utility for storing user info in localStorage
export const setUser = (user) => {
  localStorage.setItem('fairplayai_user', JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem('fairplayai_user');
  return user ? JSON.parse(user) : null;
};

export const clearUser = () => {
  localStorage.removeItem('fairplayai_user');
};
