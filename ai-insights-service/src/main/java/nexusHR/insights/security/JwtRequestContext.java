package nexusHR.insights.security;
public final class JwtRequestContext {
    private static final ThreadLocal<String> TOKEN = new ThreadLocal<>();
    private JwtRequestContext() {}
    public static void setToken(String token) {
        TOKEN.set(token);
    }
    public static String getToken() {
        return TOKEN.get();
    }
    public static void clear() {
        TOKEN.remove();
    }
}
