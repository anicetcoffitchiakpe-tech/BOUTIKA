<?php
/**
 * Mini routeur REST — sans composer/sans framework.
 * Usage :
 *   $router = new Router();
 *   $router->get('/api/health', fn() => ...);
 *   $router->post('/api/auth/login', [AuthController::class, 'login']);
 *   $router->group('/api', function(Router $r) {
 *       $r->get('/products', ...)
 *          ->middleware('protect');
 *   });
 *   $router->dispatch($method, $path);
 */
class Router {
    /** @var array<int,array{method:string,pattern:string,handler:callable,middlewares:array<string>}> */
    private array $routes = [];
    private array $globals = [];
    private string $prefix = '';

    /** Middlewares enregistrés par nom */
    private static array $middlewareRegistry = [];

    public static function registerMiddleware(string $name, callable $fn): void {
        self::$middlewareRegistry[$name] = $fn;
    }

    public function use(callable $fn): self {
        $this->globals[] = $fn;
        return $this;
    }

    public function group(string $prefix, callable $fn): self {
        $previous = $this->prefix;
        $this->prefix = $previous . $prefix;
        $fn($this);
        $this->prefix = $previous;
        return $this;
    }

    public function get(string $path, callable|array $handler): self { return $this->add('GET', $path, $handler); }
    public function post(string $path, callable|array $handler): self { return $this->add('POST', $path, $handler); }
    public function put(string $path, callable|array $handler): self { return $this->add('PUT', $path, $handler); }
    public function patch(string $path, callable|array $handler): self { return $this->add('PATCH', $path, $handler); }
    public function delete(string $path, callable|array $handler): self { return $this->add('DELETE', $path, $handler); }

    public function middleware(string ...$names): self {
        $idx = count($this->routes) - 1;
        if ($idx >= 0) {
            $this->routes[$idx]['middlewares'] = array_merge($this->routes[$idx]['middlewares'], $names);
        }
        return $this;
    }

    private function add(string $method, string $path, callable|array $handler): self {
        $this->routes[] = [
            'method'      => $method,
            'pattern'     => $this->prefix . $path,
            'handler'     => $handler,
            'middlewares' => [],
        ];
        return $this;
    }

    public function dispatch(string $method, string $uri): void {
        // Nettoie l'URI : enlève les query string
        $path = parse_url($uri, PHP_URL_PATH) ?: '/';

        foreach ($this->globals as $mw) {
            $mw();
        }

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) continue;

            $params = [];
            if ($this->match($route['pattern'], $path, $params)) {
                // Exécute les middlewares enregistrés
                foreach ($route['middlewares'] as $name) {
                    if (!isset(self::$middlewareRegistry[$name])) {
                        api_error(500, "Middleware '$name' non enregistré.");
                    }
                    call_user_func(self::$middlewareRegistry[$name]);
                }
                // Appelle le handler avec les params
                $response = call_user_func_array($route['handler'], $params);
                if ($response !== null) {
                    json_response($response);
                }
                return;
            }
        }

        not_found();
    }

    private function match(string $pattern, string $path, array &$params): bool {
        // Convertit :param en ([^/]+)
        $regex = preg_replace('#:([a-zA-Z_][a-zA-Z0-9_]*)#', '(?<$1>[^/]+)', $pattern);
        $regex = "#^" . $regex . "$#";
        if (preg_match($regex, $path, $m)) {
            foreach ($m as $k => $v) {
                if (is_string($k)) $params[] = $v;
            }
            return true;
        }
        return false;
    }
}
