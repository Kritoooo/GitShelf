# 程序清单2-1 一个无状态的Servlet

@ThreadSafe   
public class StatelessFactorizer implements Servlet { public void service(ServletRequest req, ServletResponse resp) { AtomicInteger i $=$ extractFromRequest的要求); AtomicInteger[] factors $=$ factor(i); encodeIntoResponse(resp，factors); } 王状告对象是什么？

与大多数 Servlet 相同, StatelessFactorizer 是无状态的: 它既不包含任何域, 也不包含任何对其他类中域的引用。计算过程中的临时状态仅存在于线程栈上的局部变量中, 并且只能由正在执行的线程访问。访问 StatelessFactorizer 的线程不会影响另一个访问同一个 StatelessFactorizer 的线程的计算结果, 因为这两个线程并没有共享状态, 就好像它们都在访问不同的实例。由于线程访问无状态对象的行为并不会影响其他线程中操作的正确性, 因此无状态对象是线程安全的。

无状态对象一定是线程安全的。

大多数Servlet都是无状态的，从而极大地降低了在实现Servlet线程安全性时的复杂性。只有当Servlet在处理请求时需要保存一些信息，线程安全性才会成为一个问题。