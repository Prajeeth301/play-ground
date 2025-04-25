Here’s a comprehensive list of **edge cases** to consider when dealing with **JWT-based authentication in an Angular app**:

---

### 🔒 **Token Handling Issues**
1. **Expired Access Token**
   - Token expires while user is actively using the app (mid-session). [handled in interceptors]
   - Token is already expired when the app starts (e.g., from localStorage). [authService validating user on page load]

2. **Missing Token**
   - Token not stored properly in localStorage/sessionStorage. [handle properly]
   - Token deleted manually by user or cleared by browser.  [authService validating user on page load]

3. **Malformed or Tampered Token**
   - Token has an invalid structure or has been manually tampered with. [handled in interceptors]

4. **Mismatched Token Source**
   - Token expected in `Authorization` header but found elsewhere (e.g., cookies or query params). [handle properly]

---

### 🔁 **Token Refresh & Expiry**
5. **Refresh Token Expired**
   - Refresh token has expired, but app still tries to refresh silently. [handled but need to Test]

6. **Simultaneous Requests with Expired Token**
   - Multiple HTTP requests triggered at the same time while access token is expired → may cause multiple refresh requests.

7. **Refresh Token Reuse Attack**
   - Refresh token is stolen and used to gain access. [need to dig deep]

8. **Token Rotation Issues**
   - Server issues a new refresh token on each refresh but the client keeps using the old one. [Not an issue as i am using cookie]

---

### 🔄 **State Synchronization Across Tabs**
9. **Token Revoked in Another Tab**
   - User logs out in one tab but remains logged in on other tabs unless synchronization is handled.

10. **Multiple Tabs Refreshing Token Simultaneously**
    - All tabs try refreshing the token at the same time, causing race conditions or invalid token states. [No issue]

---

### 🔐 **Security & Storage**
11. **Token Stored Insecurely**
    - Token stored in `localStorage` and exposed to XSS attacks.

12. **Token Leakage**
    - Tokens accidentally logged in the console or sent to third-party APIs.

13. **Token Present in URL**
    - JWT in query parameters (vulnerable to leaks via browser history or referrer headers).

---

### 🚪 **Login / Logout Edge Cases**
14. **Immediate Expiry After Login**
    - User logs in but receives a token that is already expired (due to server clock issues).

15. **Unauthorized Access to Protected Routes**
    - Navigation to protected routes before token is validated.

16. **Stale Auth State on App Reload**
    - App restores session from old/inconsistent storage state on reload.

17. **Logout While API Call is In Progress**
    - API call completes after logout and refreshes token or updates UI incorrectly.

---

### 📡 **Network & Server Errors**
18. **Token Refresh Fails Due to Network Errors**
    - Refresh fails and user is logged out unintentionally.

19. **Server Returns 401 for Valid Token**
    - Server state changes (e.g., user deactivated), but client keeps sending valid token.

20. **Desync Between Client & Server Time**
    - Client calculates expiry based on local time, which differs from server time.

---

### 📱 **Mobile or Offline Scenarios**
21. **Token Expiry During Offline Period**
    - User returns online after token has expired.

22. **Refresh Attempt While Offline**
    - Refresh request fails and logs user out even though they never left the app.

---

### 🧪 **Testing / Debugging**
23. **Fake Tokens in Development**
    - Devs use hardcoded/fake tokens for testing that might cause unintended behavior in production.

24. **Token Mocks Not Reflecting Real Expiry Behavior**
    - Tests do not accurately simulate expiration or rotation issues.

---

If you're building a **robust JWT-auth flow** in Angular, you’ll want to handle these cases using:

- HTTP interceptors for attaching/refreshing tokens
- A global error handler for auth-related errors
- A shared AuthService with state management
- BroadcastChannel or Storage events for cross-tab logout
- RxJS operators to prevent multiple refresh requests

---

Let me know if you want a sample architecture or code snippet to handle these cases gracefully.

Sliding Expiry
Absolute Expiry