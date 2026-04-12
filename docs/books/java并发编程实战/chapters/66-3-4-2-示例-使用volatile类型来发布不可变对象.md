# 3.4.2 示例：使用Volatile类型来发布不可变对象

在前面的 UnsafeCachingFactorizer 类中，我们尝试用两个 AtomicReferences 变量来保存最新的数值及其因数分解结果，但这种方式并非是线程安全的，因为我们无法以原子方式来同时读取或更新这两个相关的值。同样，用 volatile 类型的变量来保存这些值也不是线程安全的。然而，在某些情况下，不可变对象能提供一种弱形式的原子性。

因式分解Servlet将执行两个原子操作：更新缓存的结果，以及通过判断缓存中的数值是否等于请求的数值来决定是否直接读取缓存中的因数分解结果。每当需要对一组相关数据以原子方式执行某个操作时，就可以考虑创建一个不可变的类来包含这些数据，例如程序清单3-12中的OneValueCache。

程序清单3-12 对数值及其因数分解结果进行缓存的不可变容器类  
@Immutable   
class OneValueCache { private final AtomicInteger lastNumber; private final AtomicInteger[] lastFactors; publicOneValueCache( AtomicInteger i, AtomicInteger[] factors){ lastNumber $= \mathrm{i}$ . lastFactors $=$ Arrays.copyOf(factors,factors.length); } public AtomicInteger[] getFactors( AtomicInteger i){ if(lastNumber $= =$ null || !lastNumber.equals(i)) return null; else return Arrays.copyOf(lastFactors, lastFactors.length); 1

对于在访问和更新多个相关变量时出现的竞争条件问题，可以通过将这些变量全部保存在一个不可变对象中来消除。如果是一个可变的对象，那么就必须使用锁来确保原子性。如果是一个不可变对象，那么当线程获得了对该对象的引用后，就不必担心另一个线程会修改对象的状态。如果要更新这些变量，那么可以创建一个新的容器对象，但其他使用原有对象的线程仍然会看到对象处于一致的状态。

程序清单3-13中的VolatileCachedFactorizer使用了OneValueCache来保存缓存的数值及其因数。当一个线程将volatile类型的cache设置为引用一个新的OneValueCache时，其他线程就会立即看到新缓存的数据。

程序清单3-13 使用指向不可变容器对象的volatile类型引用以缓存最新的结果  
@ThreadSafe   
public class VolatileCachedFactorizer implements Servlet { private volatile OneValueCache cache $=$ new OneValueCache(null, null); public void service(ServletRequest req, ServletResponse resp) { AtomicInteger i $=$ extractFromRequestreq); AtomicInteger[] factors $=$ cache.getFactors(i); if (factors $= =$ null){ factors $=$ factor(i); cache $=$ new OneValueCache(i,factors); } encodeIntoResponse(resp,factors); 1

与cache相关的操作不会相互干扰，因为OneValueCache是不可变的，并且在每条相应的代码路径中只会访问它一次。通过使用包含多个状态变量的容器对象来维持不变性条件，并使用一个volatile类型的引用来确保可见性，使得VolatileCachedFactorizer在没有显式地使用锁的情况下仍然是线程安全的。