export function isLoggedIn() {
  return !!localStorage.getItem("accessToken");
}
