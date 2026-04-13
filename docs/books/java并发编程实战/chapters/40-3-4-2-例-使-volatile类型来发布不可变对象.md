# 3.4.2 ⽰例：使⽤Volatile类型来发布不可变对象

在前⾯的UnsafeCachingFactorizer类中，我们尝试⽤两个

AtomicReferences变量来保存最新的数值及其因数分解结果，但这种⽅式并⾮是线程安全的，因为我们⽆法以原⼦⽅式来同时读取或更新这两个相关的值。同样，⽤volatile类型的变量来保存这些值也不是线程安全的。然⽽，在某些情况下，不可变对象能提供⼀种弱形式的原⼦性。

因式分解Servlet将执⾏两个原⼦操作：更新缓存的结果，以及通过判断缓存中的数值是否等于请求的数值来决定是否直接读取缓存中的因数分解结果。每当需要对⼀组相关数据以原⼦⽅式执⾏某个操作时，就可以考虑创建⼀个不可变的类来包含这些数据，例如程序清单3-12中的OneValueCache [1]。

程序清单3-12 对数值及其因数分解结果进⾏缓存的不可变容器类

@Immutable

class OneValueCache{

private final BigInteger lastNumber；

private final BigInteger[]lastFactors；

public OneValueCache（BigInteger i，

BigInteger[]factors）{

lastNumber ${ \mathop { \bf \Phi } } = \dot { \bf \Phi }$ ；

lastFactors=Arrays.copyOf（factors, factors.length）；

}   
public AtomicInteger[]getFactors ( AtomicInteger i) { if (lastNumber $= =$ null||！lastNumber.equals(i)) return null; else return Arrays.copyOf(lastFactors，lastFactors.length）; }

对于在访问和更新多个相关变量时出现的竞争条件问题，可以通过将这些变量全部保存在⼀个不可变对象中来消除。如果是⼀个可变的对象，那么就必须使⽤锁来确保原⼦性。如果是⼀个不可变对象，那么当线程获得了对该对象的引⽤后，就不必担⼼另⼀个线程会修改对象的状态。如果要更新这些变量，那么可以创建⼀个新的容器对象，但其他使⽤原有对象的线程仍然会看到对象处于⼀致的状态。

程序清单3-13中的VolatileCachedFactorizer使⽤了OneValueCache来保存缓存的数值及其因数。当⼀个线程将volatile类型的cache设置为引⽤⼀个新的OneValueCache时，其他线程就会⽴即看到新缓存的数据。

程序清单3-13 使⽤指向不可变容器对象的volatile类型引⽤以缓存最新的结果

@ThreadSafe

public class VolatileCachedFactorizer implements Servlet{

private volatile OneValueCache cache=   
new OneValueCache (null, null) ;   
public void service (ServletRequest req, ServletResponse resp) { AtomicInteger i $\equiv$ extractFromRequest (req) ; AtomicInteger[]factors $\equiv$ cache.getFactors (i) ; if (factors $\equiv$ null) { factors $\equiv$ factor (i) ; cache $=$ new OneValueCache (i, factors) ; } encodeIntoResponse (resp, factors) ; }

与cache相关的操作不会相互⼲扰，因为OneValueCache是不可变的，并且在每条相应的代码路径中只会访问它⼀次。通过使⽤包含多个状态变量的容器对象来维持不变性条件，并使⽤⼀个volatile类型的引⽤来确保可⻅性，使得Volatile Cached Factorizer在没有显式地使⽤锁的情况下仍然是线程安全的。

[1] 如 果 在 OneValueCache 和 构 造 函 数 中 没 有 调 ⽤ copyOf ， 那 么OneValueCache就不是不可变的。Arrays.copyOf是在Java 6中引⼊的，同样还可以使⽤clone。