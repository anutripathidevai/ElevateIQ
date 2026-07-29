import type { LLDProblemContent } from "../types";

export const apiGateway: LLDProblemContent = {
  slug: "api-gateway",

  statementMD: [
    "Design the low-level object model for an **API Gateway** that receives client",
    "requests, matches them to backend services, applies a configurable filter",
    "chain, transforms requests and responses, and returns a single consistent",
    "gateway response.",
    "",
    "The interview is about the LLD view: classes, ownership, extension seams, and",
    "how cross-cutting concerns such as authentication, rate limiting, logging, and",
    "transformation are added without rewriting route matching or backend dispatch.",
  ].join("\n"),

  businessContextMD: [
    "API gateways sit at the front door of microservice platforms at companies like",
    "Amazon, Netflix, and Atlassian. They concentrate concerns that would otherwise",
    "be duplicated in every service: identity checks, quotas, request normalization,",
    "audit logging, response shaping, and routing. Interviewers use this problem to",
    "see whether you can keep routing policy separate from middleware policy and",
    "avoid a giant controller full of conditionals.",
  ].join("\n"),

  functionalRequirements: [
    "Accept a **Request** with method, path, headers, body, and client identity.",
    "Match the request against ordered **Route** rules and pick the target backend service.",
    "Resolve backend service names through a **ServiceRegistry** instead of hard-coding service objects.",
    "Run a filter chain before dispatch so authentication, rate limiting, logging, and transformation are composable.",
    "Allow request and response transformation as pluggable strategies in the chain.",
    "Return consistent **Response** objects for success, unauthorized access, throttling, no route, and backend errors.",
    "Allow new filters to be inserted without changing route matching or backend service classes.",
  ],

  nonFunctionalRequirements: [
    {
      label: "Extensibility of cross-cutting concerns",
      detailMD:
        "Adding a new filter such as metrics, feature flags, or request signing should mean adding one class and registering it in order, not editing **ApiGateway.dispatch**.",
    },
    {
      label: "Predictable ordering",
      detailMD:
        "Filters run in a deterministic order because auth before rate limit before logging can produce different semantics than the reverse.",
    },
    {
      label: "Low routing latency",
      detailMD:
        "The base implementation uses an ordered in-memory route list for clarity; production can replace it with a trie or indexed matcher without changing filters.",
    },
    {
      label: "Failure isolation",
      detailMD:
        "Gateway-generated failures such as 401, 429, and 404 are returned before backend dispatch, so downstream services are protected from bad traffic.",
    },
    {
      label: "Thread safety at shared state",
      detailMD:
        "The registry and rate limiter guard mutable maps. Immutable request and response objects prevent filters from corrupting shared state.",
    },
  ],

  requirementClarification: [
    {
      question: "Is this a system-design gateway with service discovery, retries, and autoscaling?",
      answerMD:
        "No. Focus on the LLD view: request model, route matching, filter chain, transformation, and service registry. Retries and discovery adapters are production extensions.",
    },
    {
      question: "Should filters be tied to individual routes or shared globally?",
      answerMD:
        "Use a global ordered chain for the base design. Route-specific filters can be added later by letting **Route** provide extra filters around the same dispatch seam.",
    },
    {
      question: "What route matching rules are required?",
      answerMD:
        "Support method plus path-prefix matching through a **Route** matcher strategy. Exact paths, host routing, and header predicates are extensions.",
    },
    {
      question: "Do transformations happen before or after routing?",
      answerMD:
        "The transformation filter normalizes the request before dispatch and shapes the response after dispatch. Route matching still receives the normalized request.",
    },
    {
      question: "Do we model real HTTP clients and network I/O?",
      answerMD:
        "No. A **BackendService** interface represents a backend. The gateway proxies to that interface; real network clients are adapters behind it.",
    },
  ],

  classDiagramMermaid: [
    "classDiagram",
    "    class Request {",
    "        -String method",
    "        -String path",
    "        -Map~String,String~ headers",
    "        -String body",
    "        -String clientId",
    "        +header(String) String",
    "        +withHeader(String, String) Request",
    "    }",
    "    class Response {",
    "        -int statusCode",
    "        -String body",
    "        -Map~String,String~ headers",
    "        +status(int) Builder",
    "        +withHeader(String, String) Response",
    "    }",
    "    class Filter {",
    "        <<interface>>",
    "        +apply(Request, FilterChain) Response",
    "    }",
    "    class FilterChain {",
    "        -List~Filter~ filters",
    "        -TerminalHandler terminal",
    "        -int index",
    "        +proceed(Request) Response",
    "    }",
    "    class AuthFilter",
    "    class RateLimitFilter",
    "    class LoggingFilter",
    "    class TransformationFilter",
    "    class Route {",
    "        -String name",
    "        -Predicate~Request~ matcher",
    "        -String serviceName",
    "        +matches(Request) boolean",
    "    }",
    "    class ApiGateway {",
    "        -List~Route~ routes",
    "        -List~Filter~ filters",
    "        -ServiceRegistry registry",
    "        +handle(Request) Response",
    "        -dispatch(Request) Response",
    "    }",
    "    class ServiceRegistry {",
    "        -Map~String,BackendService~ services",
    "        +getInstance() ServiceRegistry",
    "        +register(String, BackendService) void",
    "        +resolve(String) BackendService",
    "    }",
    "    class BackendService {",
    "        <<interface>>",
    "        +handle(Request) Response",
    "    }",
    "    Filter <|.. AuthFilter",
    "    Filter <|.. RateLimitFilter",
    "    Filter <|.. LoggingFilter",
    "    Filter <|.. TransformationFilter",
    "    FilterChain o-- Filter",
    "    ApiGateway o-- Route",
    "    ApiGateway o-- Filter",
    "    ApiGateway --> ServiceRegistry",
    "    Route --> BackendService",
    "    ServiceRegistry o-- BackendService",
    "    BackendService ..> Response",
    "    BackendService ..> Request",
  ].join("\n"),
  classDiagramCaptionMD:
    "The key seam is **Filter.apply(Request, FilterChain)**. Filters form a Chain of Responsibility before **ApiGateway.dispatch** performs routing and proxy dispatch.",

  sequenceDiagramMermaid: [
    "sequenceDiagram",
    "    actor Client",
    "    participant Gateway as ApiGateway",
    "    participant Chain as FilterChain",
    "    participant Auth as AuthFilter",
    "    participant Rate as RateLimitFilter",
    "    participant Log as LoggingFilter",
    "    participant Route as Route",
    "    participant Registry as ServiceRegistry",
    "    participant Backend as BackendService",
    "    Client->>Gateway: handle(request)",
    "    Gateway->>Chain: start(filters, dispatch)",
    "    Chain->>Auth: apply(request, chain)",
    "    Auth->>Chain: proceed(request)",
    "    Chain->>Rate: apply(request, chain)",
    "    Rate->>Chain: proceed(request)",
    "    Chain->>Log: apply(request, chain)",
    "    Log->>Chain: proceed(request)",
    "    Chain->>Gateway: dispatch(transformed request)",
    "    Gateway->>Route: matches(request)",
    "    Route-->>Gateway: true",
    "    Gateway->>Registry: resolve(serviceName)",
    "    Registry-->>Gateway: backend",
    "    Gateway->>Backend: handle(request)",
    "    Backend-->>Gateway: response",
    "    Gateway-->>Chain: response",
    "    Chain-->>Client: transformed response",
  ].join("\n"),
  sequenceDiagramCaptionMD:
    "Routing is reached only after filters choose to call **proceed**. A filter can short-circuit with 401 or 429 without any backend call.",

  entities: [
    {
      name: "Request",
      responsibilityMD:
        "Immutable inbound message carrying method, path, headers, body, and client id. Filters can create modified copies instead of mutating shared state.",
      attributes: ["method", "path", "headers", "body", "clientId"],
    },
    {
      name: "Response",
      responsibilityMD:
        "Immutable outbound message with status, headers, and body. Gateway, filters, and backends all return the same response abstraction.",
      attributes: ["statusCode", "headers", "body"],
    },
    {
      name: "Filter",
      responsibilityMD:
        "Middleware contract. Each filter may reject the request, enrich it, observe it, or call **chain.proceed** to pass control onward.",
      attributes: ["apply(request, chain)"],
    },
    {
      name: "FilterChain",
      responsibilityMD:
        "Chain cursor that invokes filters one by one and finally calls the terminal gateway dispatch function.",
      attributes: ["filters", "terminal", "index"],
    },
    {
      name: "AuthFilter",
      responsibilityMD:
        "Checks the authorization header before traffic reaches routing or backend services. It protects every route uniformly.",
      attributes: ["validTokens"],
    },
    {
      name: "RateLimitFilter",
      responsibilityMD:
        "Maintains per-client fixed windows and short-circuits with **429** when a caller exceeds quota.",
      attributes: ["limit", "windowSeconds", "windows"],
    },
    {
      name: "LoggingFilter / TransformationFilter",
      responsibilityMD:
        "Logging observes both sides of the chain. Transformation applies request and response strategies around downstream processing.",
      attributes: ["requestTransformer", "responseTransformer"],
    },
    {
      name: "Route",
      responsibilityMD:
        "A named routing rule. It owns a matcher strategy and the backend service name to resolve when the rule matches.",
      attributes: ["name", "matcher", "serviceName"],
    },
    {
      name: "ApiGateway",
      responsibilityMD:
        "Facade and proxy entry point. It builds the chain for each request, then dispatches matched traffic to a backend from the registry.",
      attributes: ["routes", "filters", "registry"],
    },
    {
      name: "ServiceRegistry",
      responsibilityMD:
        "Singleton registry from logical service name to **BackendService**. It decouples routes from concrete backend objects.",
      attributes: ["services", "getInstance", "register", "resolve"],
    },
  ],

  patternsUsed: [
    {
      name: "Chain of Responsibility",
      whyMD:
        "**FilterChain** lets authentication, rate limiting, logging, and transformation decide independently whether to handle, reject, or forward a request. New cross-cutting concerns are additive and do not touch routing.",
    },
    {
      name: "Strategy",
      whyMD:
        "**Route** accepts a matcher strategy, and **TransformationFilter** accepts request and response transformation strategies. Matching and shaping logic can vary without subclassing the gateway.",
    },
    {
      name: "Proxy",
      whyMD:
        "**ApiGateway** is the client-facing proxy for backend services. It controls access, adds policies, and forwards only clean requests to **BackendService**.",
    },
    {
      name: "Singleton",
      whyMD:
        "**ServiceRegistry.getInstance** provides one shared in-memory registry for the demo so all routes resolve names against the same source of truth.",
    },
  ],

  designSteps: [
    {
      title: "Start with immutable request and response messages",
      detailMD:
        "Filters should not mutate a shared request in place. **Request.withHeader** and **Response.withHeader** return copies, making it safe for transformations to enrich messages.",
      code: [
        "public Request withHeader(String name, String value) {",
        "    return toBuilder().header(name, value).build();",
        "}",
      ].join("\n"),
    },
    {
      title: "Define middleware as a Chain of Responsibility",
      detailMD:
        "The filter contract receives the current request and a chain cursor. A filter can return immediately or call **proceed**. That one method is the extension seam for auth, quotas, logging, metrics, and transformation.",
      code: [
        "public interface Filter {",
        "    Response apply(Request request, FilterChain chain);",
        "}",
        "",
        "public Response proceed(Request request) {",
        "    if (index == filters.size()) {",
        "        return terminal.handle(request);",
        "    }",
        "    FilterChain nextChain = new FilterChain(filters, terminal, index + 1);",
        "    return filters.get(index).apply(request, nextChain);",
        "}",
      ].join("\n"),
    },
    {
      title: "Keep authentication and rate limiting out of routing",
      detailMD:
        "**AuthFilter** and **RateLimitFilter** short-circuit before dispatch. **ApiGateway.dispatch** does not know why a request was rejected because rejection belongs to filters.",
    },
    {
      title: "Represent route matching as a strategy",
      detailMD:
        "A **Route** owns a predicate. The starter factory builds method plus prefix routes, but exact path, host-based, or header-based routes can reuse the same gateway.",
      code: [
        "public boolean matches(Request request) {",
        "    return matcher.test(request);",
        "}",
      ].join("\n"),
    },
    {
      title: "Resolve services by name through a registry",
      detailMD:
        "Routes store logical service names. **ServiceRegistry** maps those names to **BackendService** implementations so route configuration and service construction remain separate.",
    },
    {
      title: "Place transformation around dispatch",
      detailMD:
        "**TransformationFilter** normalizes the request before **proceed** and shapes the response after **proceed** returns. It is still just another filter in the same chain.",
      code: [
        "Request outgoing = requestTransformer.apply(request);",
        "Response incoming = chain.proceed(outgoing);",
        "return responseTransformer.apply(incoming);",
      ].join("\n"),
    },
    {
      title: "Make the gateway a proxy, not a policy dump",
      detailMD:
        "**ApiGateway.handle** runs the chain and **dispatch** only matches routes plus calls the registry. Every cross-cutting decision lives in a filter, keeping routing stable.",
    },
  ],

  implementation: [
    {
      filename: "Request.java",
      language: "java",
      content: [
        "import java.util.Collections;",
        "import java.util.LinkedHashMap;",
        "import java.util.Map;",
        "import java.util.Objects;",
        "",
        "public final class Request {",
        "    private final String method;",
        "    private final String path;",
        "    private final Map<String, String> headers;",
        "    private final String body;",
        "    private final String clientId;",
        "",
        "    private Request(Builder builder) {",
        "        this.method = builder.method;",
        "        this.path = builder.path;",
        "        this.headers = Collections.unmodifiableMap(new LinkedHashMap<>(builder.headers));",
        "        this.body = builder.body;",
        "        this.clientId = builder.clientId;",
        "    }",
        "",
        "    public static Builder builder(String method, String path) {",
        "        return new Builder(method, path);",
        "    }",
        "",
        "    public String method() {",
        "        return method;",
        "    }",
        "",
        "    public String path() {",
        "        return path;",
        "    }",
        "",
        "    public String body() {",
        "        return body;",
        "    }",
        "",
        "    public String clientId() {",
        "        return clientId;",
        "    }",
        "",
        "    public String header(String name) {",
        "        return headers.get(name);",
        "    }",
        "",
        "    public Map<String, String> headers() {",
        "        return headers;",
        "    }",
        "",
        "    public Request withHeader(String name, String value) {",
        "        return toBuilder().header(name, value).build();",
        "    }",
        "",
        "    public Request withBody(String body) {",
        "        return toBuilder().body(body).build();",
        "    }",
        "",
        "    public Builder toBuilder() {",
        "        Builder builder = new Builder(method, path).body(body).clientId(clientId);",
        "        for (Map.Entry<String, String> entry : headers.entrySet()) {",
        "            builder.header(entry.getKey(), entry.getValue());",
        "        }",
        "        return builder;",
        "    }",
        "",
        "    public static final class Builder {",
        "        private final String method;",
        "        private final String path;",
        "        private final Map<String, String> headers = new LinkedHashMap<>();",
        "        private String body = \"\";",
        "        private String clientId = \"anonymous\";",
        "",
        "        private Builder(String method, String path) {",
        "            this.method = Objects.requireNonNull(method, \"method\").toUpperCase();",
        "            this.path = Objects.requireNonNull(path, \"path\");",
        "        }",
        "",
        "        public Builder header(String name, String value) {",
        "            headers.put(Objects.requireNonNull(name, \"name\"), Objects.requireNonNull(value, \"value\"));",
        "            return this;",
        "        }",
        "",
        "        public Builder body(String body) {",
        "            this.body = Objects.requireNonNull(body, \"body\");",
        "            return this;",
        "        }",
        "",
        "        public Builder clientId(String clientId) {",
        "            this.clientId = Objects.requireNonNull(clientId, \"clientId\");",
        "            return this;",
        "        }",
        "",
        "        public Request build() {",
        "            return new Request(this);",
        "        }",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "Response.java",
      language: "java",
      content: [
        "import java.util.Collections;",
        "import java.util.LinkedHashMap;",
        "import java.util.Map;",
        "import java.util.Objects;",
        "",
        "public final class Response {",
        "    private final int statusCode;",
        "    private final String body;",
        "    private final Map<String, String> headers;",
        "",
        "    private Response(Builder builder) {",
        "        this.statusCode = builder.statusCode;",
        "        this.body = builder.body;",
        "        this.headers = Collections.unmodifiableMap(new LinkedHashMap<>(builder.headers));",
        "    }",
        "",
        "    public static Builder status(int statusCode) {",
        "        return new Builder(statusCode);",
        "    }",
        "",
        "    public static Response ok(String body) {",
        "        return status(200).body(body).build();",
        "    }",
        "",
        "    public int statusCode() {",
        "        return statusCode;",
        "    }",
        "",
        "    public String body() {",
        "        return body;",
        "    }",
        "",
        "    public Map<String, String> headers() {",
        "        return headers;",
        "    }",
        "",
        "    public boolean isError() {",
        "        return statusCode >= 400;",
        "    }",
        "",
        "    public Response withHeader(String name, String value) {",
        "        Builder builder = status(statusCode).body(body);",
        "        for (Map.Entry<String, String> entry : headers.entrySet()) {",
        "            builder.header(entry.getKey(), entry.getValue());",
        "        }",
        "        return builder.header(name, value).build();",
        "    }",
        "",
        "    public static final class Builder {",
        "        private final int statusCode;",
        "        private final Map<String, String> headers = new LinkedHashMap<>();",
        "        private String body = \"\";",
        "",
        "        private Builder(int statusCode) {",
        "            this.statusCode = statusCode;",
        "        }",
        "",
        "        public Builder header(String name, String value) {",
        "            headers.put(Objects.requireNonNull(name, \"name\"), Objects.requireNonNull(value, \"value\"));",
        "            return this;",
        "        }",
        "",
        "        public Builder body(String body) {",
        "            this.body = Objects.requireNonNull(body, \"body\");",
        "            return this;",
        "        }",
        "",
        "        public Response build() {",
        "            return new Response(this);",
        "        }",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "Filter.java",
      language: "java",
      content: [
        "import java.util.ArrayList;",
        "import java.util.Collections;",
        "import java.util.List;",
        "import java.util.Objects;",
        "",
        "public interface Filter {",
        "    Response apply(Request request, FilterChain chain);",
        "}",
        "",
        "final class FilterChain {",
        "    private final List<Filter> filters;",
        "    private final TerminalHandler terminal;",
        "    private final int index;",
        "",
        "    private FilterChain(List<Filter> filters, TerminalHandler terminal, int index) {",
        "        this.filters = Collections.unmodifiableList(new ArrayList<>(filters));",
        "        this.terminal = Objects.requireNonNull(terminal, \"terminal\");",
        "        this.index = index;",
        "    }",
        "",
        "    public static FilterChain start(List<Filter> filters, TerminalHandler terminal) {",
        "        return new FilterChain(filters, terminal, 0);",
        "    }",
        "",
        "    public Response proceed(Request request) {",
        "        if (index == filters.size()) {",
        "            return terminal.handle(request);",
        "        }",
        "        Filter nextFilter = filters.get(index);",
        "        FilterChain nextChain = new FilterChain(filters, terminal, index + 1);",
        "        return nextFilter.apply(request, nextChain);",
        "    }",
        "",
        "    interface TerminalHandler {",
        "        Response handle(Request request);",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "AuthFilter.java",
      language: "java",
      content: [
        "import java.util.HashSet;",
        "import java.util.Objects;",
        "import java.util.Set;",
        "",
        "public final class AuthFilter implements Filter {",
        "    private final Set<String> validTokens;",
        "",
        "    public AuthFilter(Set<String> validTokens) {",
        "        this.validTokens = new HashSet<>(Objects.requireNonNull(validTokens, \"validTokens\"));",
        "    }",
        "",
        "    @Override",
        "    public Response apply(Request request, FilterChain chain) {",
        "        String token = request.header(\"Authorization\");",
        "        if (token == null || !validTokens.contains(token)) {",
        "            return Response.status(401).body(\"Unauthorized\").build();",
        "        }",
        "        return chain.proceed(request);",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "RateLimitFilter.java",
      language: "java",
      content: [
        "import java.time.Clock;",
        "import java.time.Instant;",
        "import java.util.HashMap;",
        "import java.util.Map;",
        "",
        "public final class RateLimitFilter implements Filter {",
        "    private final int limit;",
        "    private final long windowSeconds;",
        "    private final Clock clock;",
        "    private final Map<String, Window> windows = new HashMap<>();",
        "",
        "    public RateLimitFilter(int limit, long windowSeconds) {",
        "        this(limit, windowSeconds, Clock.systemUTC());",
        "    }",
        "",
        "    RateLimitFilter(int limit, long windowSeconds, Clock clock) {",
        "        if (limit <= 0 || windowSeconds <= 0) {",
        "            throw new IllegalArgumentException(\"limit and windowSeconds must be positive\");",
        "        }",
        "        this.limit = limit;",
        "        this.windowSeconds = windowSeconds;",
        "        this.clock = clock;",
        "    }",
        "",
        "    @Override",
        "    public synchronized Response apply(Request request, FilterChain chain) {",
        "        Instant now = clock.instant();",
        "        String key = request.clientId();",
        "        Window window = windows.get(key);",
        "        if (window == null || now.getEpochSecond() - window.startedAt >= windowSeconds) {",
        "            window = new Window(now.getEpochSecond());",
        "            windows.put(key, window);",
        "        }",
        "",
        "        if (window.count >= limit) {",
        "            return Response.status(429)",
        "                .header(\"Retry-After\", Long.toString(windowSeconds))",
        "                .body(\"Too Many Requests\")",
        "                .build();",
        "        }",
        "",
        "        window.count++;",
        "        return chain.proceed(request);",
        "    }",
        "",
        "    private static final class Window {",
        "        private final long startedAt;",
        "        private int count;",
        "",
        "        private Window(long startedAt) {",
        "            this.startedAt = startedAt;",
        "        }",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "LoggingFilter.java",
      language: "java",
      content: [
        "import java.util.Objects;",
        "import java.util.function.Function;",
        "",
        "public final class LoggingFilter implements Filter {",
        "    @Override",
        "    public Response apply(Request request, FilterChain chain) {",
        "        System.out.println(\"gateway request \" + request.method() + \" \" + request.path());",
        "        Response response = chain.proceed(request);",
        "        System.out.println(\"gateway response \" + response.statusCode());",
        "        return response;",
        "    }",
        "}",
        "",
        "final class TransformationFilter implements Filter {",
        "    private final Function<Request, Request> requestTransformer;",
        "    private final Function<Response, Response> responseTransformer;",
        "",
        "    public TransformationFilter(",
        "        Function<Request, Request> requestTransformer,",
        "        Function<Response, Response> responseTransformer",
        "    ) {",
        "        this.requestTransformer = Objects.requireNonNull(requestTransformer, \"requestTransformer\");",
        "        this.responseTransformer = Objects.requireNonNull(responseTransformer, \"responseTransformer\");",
        "    }",
        "",
        "    @Override",
        "    public Response apply(Request request, FilterChain chain) {",
        "        Request outgoing = requestTransformer.apply(request);",
        "        Response incoming = chain.proceed(outgoing);",
        "        return responseTransformer.apply(incoming);",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "Route.java",
      language: "java",
      content: [
        "import java.util.Objects;",
        "import java.util.function.Predicate;",
        "",
        "public final class Route {",
        "    private final String name;",
        "    private final Predicate<Request> matcher;",
        "    private final String serviceName;",
        "",
        "    public Route(String name, Predicate<Request> matcher, String serviceName) {",
        "        this.name = Objects.requireNonNull(name, \"name\");",
        "        this.matcher = Objects.requireNonNull(matcher, \"matcher\");",
        "        this.serviceName = Objects.requireNonNull(serviceName, \"serviceName\");",
        "    }",
        "",
        "    public static Route prefix(String name, String method, String prefix, String serviceName) {",
        "        return new Route(",
        "            name,",
        "            request -> request.method().equalsIgnoreCase(method) && request.path().startsWith(prefix),",
        "            serviceName",
        "        );",
        "    }",
        "",
        "    public boolean matches(Request request) {",
        "        return matcher.test(request);",
        "    }",
        "",
        "    public String name() {",
        "        return name;",
        "    }",
        "",
        "    public String serviceName() {",
        "        return serviceName;",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "ApiGateway.java",
      language: "java",
      content: [
        "import java.util.ArrayList;",
        "import java.util.Collections;",
        "import java.util.HashMap;",
        "import java.util.List;",
        "import java.util.Map;",
        "import java.util.Objects;",
        "",
        "public final class ApiGateway {",
        "    private final List<Route> routes;",
        "    private final List<Filter> filters;",
        "    private final ServiceRegistry registry;",
        "",
        "    public ApiGateway(List<Route> routes, List<Filter> filters, ServiceRegistry registry) {",
        "        this.routes = Collections.unmodifiableList(new ArrayList<>(routes));",
        "        this.filters = Collections.unmodifiableList(new ArrayList<>(filters));",
        "        this.registry = Objects.requireNonNull(registry, \"registry\");",
        "    }",
        "",
        "    public Response handle(Request request) {",
        "        FilterChain chain = FilterChain.start(filters, this::dispatch);",
        "        return chain.proceed(request);",
        "    }",
        "",
        "    private Response dispatch(Request request) {",
        "        for (Route route : routes) {",
        "            if (route.matches(request)) {",
        "                try {",
        "                    BackendService backend = registry.resolve(route.serviceName());",
        "                    Request proxied = request.withHeader(\"X-Backend-Service\", route.serviceName());",
        "                    return backend.handle(proxied);",
        "                } catch (IllegalArgumentException ex) {",
        "                    return Response.status(502).body(ex.getMessage()).build();",
        "                }",
        "            }",
        "        }",
        "        return Response.status(404)",
        "            .body(\"No route for \" + request.method() + \" \" + request.path())",
        "            .build();",
        "    }",
        "}",
        "",
        "interface BackendService {",
        "    Response handle(Request request);",
        "}",
        "",
        "final class ServiceRegistry {",
        "    private static final ServiceRegistry INSTANCE = new ServiceRegistry();",
        "    private final Map<String, BackendService> services = new HashMap<>();",
        "",
        "    private ServiceRegistry() {",
        "    }",
        "",
        "    public static ServiceRegistry getInstance() {",
        "        return INSTANCE;",
        "    }",
        "",
        "    public synchronized void register(String name, BackendService service) {",
        "        services.put(Objects.requireNonNull(name, \"name\"), Objects.requireNonNull(service, \"service\"));",
        "    }",
        "",
        "    public synchronized BackendService resolve(String name) {",
        "        BackendService service = services.get(name);",
        "        if (service == null) {",
        "            throw new IllegalArgumentException(\"No service registered: \" + name);",
        "        }",
        "        return service;",
        "    }",
        "}",
      ].join("\n"),
    },
  ],

  classExplanations: [
    {
      className: "Request",
      detailMD:
        "Immutable request value object with builder-style construction and copy methods. Filters use **withHeader** and **withBody** to transform safely.",
    },
    {
      className: "Response",
      detailMD:
        "Immutable response value object used by filters, gateway-generated failures, and backends. The builder keeps status, body, and headers consistent.",
    },
    {
      className: "Filter / FilterChain",
      detailMD:
        "**Filter** is the middleware contract. **FilterChain** is the cursor that advances through filters and finally calls terminal dispatch.",
    },
    {
      className: "AuthFilter",
      detailMD:
        "Validates the authorization token and returns **401** without calling **proceed** when the caller is unknown.",
    },
    {
      className: "RateLimitFilter",
      detailMD:
        "Maintains synchronized per-client fixed windows and returns **429** with **Retry-After** when a client exceeds quota.",
    },
    {
      className: "LoggingFilter / TransformationFilter",
      detailMD:
        "**LoggingFilter** observes request and response events. **TransformationFilter** wraps downstream processing with request and response strategy functions.",
    },
    {
      className: "Route",
      detailMD:
        "Encapsulates matching policy and the logical backend name. The prefix factory is one strategy; callers may pass any predicate.",
    },
    {
      className: "ApiGateway / ServiceRegistry / BackendService",
      detailMD:
        "**ApiGateway** runs the chain then proxies to the resolved backend. **ServiceRegistry** is the singleton name-to-service map, and **BackendService** is the backend abstraction.",
    },
  ],

  dryRun: {
    inputMD:
      "Routes: **GET /users** to **user-service**, **POST /orders** to **order-service**. Filters: auth, rate limit 2 per minute, transformation adding **X-Gateway-Version**, logging. Client **c1** sends three authorized GET requests and one unauthorized request.",
    columns: ["Step", "Request", "Filter outcome", "Route chosen", "Response"],
    rows: [
      ["1", "GET /users with valid token", "Auth pass, quota 1 of 2, transformed", "user-service", "200 with gateway header"],
      ["2", "GET /users with valid token", "Auth pass, quota 2 of 2, transformed", "user-service", "200 with gateway header"],
      ["3", "GET /users with valid token", "Rate limit short-circuits", "none", "429 Too Many Requests"],
      ["4", "POST /orders without token", "Auth short-circuits", "none", "401 Unauthorized"],
      ["5", "GET /unknown with valid token from c2", "Filters pass", "none", "404 No route"],
    ],
    narrativeMD:
      "The third request proves the chain can stop before routing. The fourth proves authentication also stops before routing. The fifth proves routing failures are gateway responses, not backend errors.",
  },

  complexity: [
    {
      operation: "handle request through filters",
      time: "O(F + R)",
      space: "O(F)",
      note: "F filters are visited at most once; R routes are scanned only if all filters proceed.",
    },
    {
      operation: "route matching",
      time: "O(R)",
      space: "O(1)",
      note: "The base design scans ordered routes. A trie or indexed matcher can reduce this.",
    },
    {
      operation: "service resolution",
      time: "O(1)",
      space: "O(1)",
      note: "Hash-map lookup by service name in the singleton registry.",
    },
    {
      operation: "rate limit check",
      time: "O(1)",
      space: "O(C)",
      note: "C active clients have one fixed window each.",
    },
    {
      operation: "request or response transformation",
      time: "O(H + B)",
      space: "O(H + B)",
      note: "Copying headers and body-sized transformations dominate the cost.",
    },
  ],
  complexityNotesMD:
    "The hot path is **F + R**. Keep filters small and deterministic, then replace the route list with a trie, radix tree, or precompiled matcher when route count grows.",

  extensibility: [
    {
      label: "Adding a new filter",
      detailMD:
        "Create a class implementing **Filter** and insert it into the filter list. **ApiGateway**, **Route**, and backends remain unchanged.",
    },
    {
      label: "Changing route matching",
      detailMD:
        "Pass a different predicate into **Route** or replace route storage with a matcher component. The filter chain still ends at the same dispatch method.",
    },
    {
      label: "Adding a backend",
      detailMD:
        "Register a new **BackendService** under a logical name and add a route pointing to that name. No filter needs to know the backend exists.",
    },
    {
      label: "Route-specific policies",
      detailMD:
        "Let **Route** optionally expose extra filters and compose them before terminal dispatch. This extends policy without moving conditionals into the gateway.",
    },
    {
      label: "Dynamic service discovery",
      detailMD:
        "Swap the in-memory singleton map for a registry adapter backed by Consul, Kubernetes, or a database while preserving the **resolve** contract.",
    },
  ],

  alternativeDesigns: [
    {
      name: "Giant gateway controller",
      detailMD:
        "Put auth, rate limiting, logging, transformation, route matching, and dispatch in one **handle** method with conditionals.",
      tradeoffsMD:
        "Simple for a toy demo, but every new concern edits the same method, ordering becomes fragile, and unit tests become broad.",
    },
    {
      name: "Route owns all middleware",
      detailMD:
        "Each route carries its own filter list and the gateway selects a route before running filters.",
      tradeoffsMD:
        "Useful for route-specific policy, but global authentication and rate limiting now wait until after route matching and may be duplicated across routes.",
    },
    {
      name: "Trie-based router component",
      detailMD:
        "Move matching from an ordered list to a trie keyed by method and path segments.",
      tradeoffsMD:
        "Improves route matching for large catalogs, but adds complexity and does not replace the filter chain seam.",
    },
    {
      name: "External registry adapter",
      detailMD:
        "Use a **ServiceRegistry** interface and adapter implementations for static maps, service discovery, or load balancers.",
      tradeoffsMD:
        "More production-ready and testable than a singleton, but the singleton is concise for the interview demo.",
    },
  ],

  commonMistakes: [
    "Putting authentication, quotas, and logging inside **ApiGateway.dispatch**, which makes routing change whenever policy changes.",
    "Letting filters mutate the same **Request** instance, which makes ordering bugs hard to diagnose.",
    "Running route matching before global authentication, leaking route existence to unauthorized clients.",
    "Hard-coding backend objects inside routes instead of resolving by logical service name.",
    "Using unordered filters, which makes rate limit and authentication semantics unpredictable.",
    "Catching every backend exception as success or exposing raw exceptions directly to clients.",
    "Making the service registry a hidden global dependency in every class instead of injecting it into **ApiGateway**.",
  ],

  followUps: [
    {
      question: "How do you add metrics without touching routing?",
      answerMD:
        "Add a **MetricsFilter** that records start time, calls **proceed**, then emits latency and status. Insert it into the filter list near logging.",
    },
    {
      question: "How would you support per-route rate limits?",
      answerMD:
        "Either enrich **Request** with the matched route before quota evaluation or allow **Route** to contribute a route-specific filter list after global filters.",
    },
    {
      question: "How do you make route matching faster for thousands of routes?",
      answerMD:
        "Replace the ordered list with a method plus path trie or compiled route table. Keep **Route.matches** or a router interface so filters stay unchanged.",
    },
    {
      question: "Where do retries and circuit breakers belong?",
      answerMD:
        "They belong behind or around **BackendService** as proxy filters or backend adapters. They should not be mixed into route selection.",
    },
    {
      question: "How would you make the registry production-ready?",
      answerMD:
        "Replace the singleton map with a **ServiceRegistry** interface backed by service discovery, caching, health checks, and load balancing.",
    },
  ],

  productionConsiderations: [
    {
      label: "Observability",
      detailMD:
        "Emit structured logs, request ids, per-filter latency, route hit counts, status codes, and backend error rates. Logging as a filter keeps this orthogonal.",
    },
    {
      label: "Security",
      detailMD:
        "Validate tokens, normalize headers, strip spoofed internal headers, and avoid revealing route information to unauthorized clients.",
    },
    {
      label: "Backpressure",
      detailMD:
        "Rate limiting should be distributed in production. Use Redis or token buckets so multiple gateway instances enforce the same quota.",
    },
    {
      label: "Resilience",
      detailMD:
        "Wrap **BackendService** calls with timeouts, retries for safe operations, circuit breakers, and bulkheads so a failing backend does not pin gateway threads.",
    },
    {
      label: "Configuration safety",
      detailMD:
        "Route and filter order should be versioned, validated, and rolled out gradually. A bad rule at the gateway can impact every client.",
    },
  ],

  interviewNotes: [
    "Can the candidate clearly separate filter policy from route dispatch?",
    "Do they identify Chain of Responsibility as the main extensibility seam?",
    "Do request and response transformations avoid mutating shared objects?",
    "Does the route abstraction hide matching strategy and backend naming?",
    "Do they explain why the gateway is a proxy and where a singleton registry is only a demo simplification?",
    "Can they discuss production replacements without destroying the LLD boundaries?",
  ],

  quiz: [
    {
      question: "Why is **FilterChain** better than putting every policy in **ApiGateway.dispatch**?",
      options: [
        "It lets each cross-cutting concern be added or reordered without changing route dispatch",
        "It makes route matching constant time automatically",
        "It removes the need for backend services",
        "It guarantees distributed rate limiting",
      ],
      answerIndex: 0,
      explanationMD:
        "Chain of Responsibility isolates middleware decisions. Dispatch stays focused on matching and proxying.",
    },
    {
      question: "Which filter should usually run before backend dispatch?",
      options: [
        "A filter that prints the final response body only",
        "Authentication, because unauthorized traffic should not reach routing or backends",
        "A backend database migration filter",
        "A route deletion filter",
      ],
      answerIndex: 1,
      explanationMD:
        "Authentication protects all downstream work and can short-circuit early with **401**.",
    },
    {
      question: "What does the **Route** matcher strategy buy you?",
      options: [
        "Only one route can exist",
        "The gateway can switch from prefix matching to host or header matching without changing filter code",
        "Backends no longer need to return responses",
        "Rate limiting becomes persistent",
      ],
      answerIndex: 1,
      explanationMD:
        "Matching is variable behavior. Putting it behind a predicate keeps the gateway independent of a specific matching algorithm.",
    },
    {
      question: "Why is **ApiGateway** a Proxy in this design?",
      options: [
        "It subclasses every backend service",
        "It exposes the same client-facing access point while controlling and forwarding calls to backend services",
        "It stores every response forever",
        "It creates all filters through reflection",
      ],
      answerIndex: 1,
      explanationMD:
        "A proxy stands between client and real subject. The gateway controls access and forwards to **BackendService**.",
    },
    {
      question: "What is the main limitation of the singleton **ServiceRegistry** shown here?",
      options: [
        "It cannot store strings",
        "It is convenient for a demo but should become an injected interface for tests, multiple environments, and service discovery",
        "It prevents route matching",
        "It forces every filter to be a singleton",
      ],
      answerIndex: 1,
      explanationMD:
        "Singleton is acceptable for a compact interview implementation, but production code usually prefers an injected registry abstraction.",
    },
  ],

  practiceVariants: [
    {
      title: "Add a metrics filter",
      detailMD:
        "Implement **MetricsFilter** that measures latency around **proceed**, tags by route or status, and proves routing code stays unchanged.",
      difficulty: "Intermediate",
    },
    {
      title: "Per-route filter chains",
      detailMD:
        "Extend **Route** to include optional filters for admin-only routes while keeping global filters in front of all traffic.",
      difficulty: "Advanced",
    },
    {
      title: "Trie router",
      detailMD:
        "Replace ordered route scanning with a method plus path trie. Keep the public **ApiGateway.handle** and filter contracts unchanged.",
      difficulty: "Expert",
    },
  ],

  flashcards: [
    {
      front: "What is the core pattern in the API Gateway LLD?",
      back: "Chain of Responsibility: **Filter** objects call **proceed** or short-circuit before dispatch.",
    },
    {
      front: "Where should authentication logic live?",
      back: "In **AuthFilter**, not in **ApiGateway.dispatch** or backend services.",
    },
    {
      front: "What owns route matching?",
      back: "**Route** owns a matcher strategy and a backend service name.",
    },
    {
      front: "Why is the gateway a Proxy?",
      back: "Clients call **ApiGateway**, which controls access and forwards to the real **BackendService**.",
    },
    {
      front: "What does **TransformationFilter** demonstrate?",
      back: "Request and response transformation as strategy functions around downstream processing.",
    },
    {
      front: "What is the production replacement for the singleton registry?",
      back: "An injected **ServiceRegistry** interface backed by service discovery, health checks, and load balancing.",
    },
  ],

  cheatSheetMD: [
    "**Core model:** Request, Response, Filter, FilterChain, Route, ApiGateway, ServiceRegistry, BackendService.",
    "",
    "**Flow:** handle → auth filter → rate limit filter → logging or transformation filters → dispatch → route match → registry resolve → backend handle → response transformations.",
    "",
    "**Patterns:** Chain of Responsibility for middleware, Strategy for matching and transformations, Proxy for client-facing forwarding, Singleton for the demo registry.",
    "",
    "**Key invariant:** adding a cross-cutting concern must not modify route matching or backend dispatch.",
    "",
    "**Short-circuits:** auth returns 401, rate limit returns 429, no route returns 404, missing backend returns 502.",
    "",
    "**Scale path:** distributed quotas, trie router, injected service discovery registry, backend timeout and circuit-breaker adapters.",
  ].join("\n"),

  references: [
    {
      title: "Enterprise Integration Patterns — Pipes and Filters",
      kind: "Book",
      author: "Gregor Hohpe and Bobby Woolf",
    },
    {
      title: "Refactoring Guru — Chain of Responsibility",
      kind: "Docs",
      url: "https://refactoring.guru/design-patterns/chain-of-responsibility",
    },
    {
      title: "Microsoft Azure Architecture Center — Gateway Routing pattern",
      kind: "Docs",
      url: "https://learn.microsoft.com/azure/architecture/patterns/gateway-routing",
    },
    {
      title: "NGINX Documentation — Reverse Proxy",
      kind: "Docs",
      url: "https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/",
    },
  ],

  relatedProblems: [
    { slug: "rate-limiter", note: "Rate limiting is one of the gateway filters and often needs a distributed implementation." },
    { slug: "authentication-service", note: "Authentication is usually delegated to an identity service but enforced at the gateway boundary." },
    { slug: "feature-flag-service", note: "Feature flags can be introduced as another filter that changes routing or response shaping." },
  ],
};
