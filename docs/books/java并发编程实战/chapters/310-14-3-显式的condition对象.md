# 14.3 显式的Condition对象

第13章曾介绍过，在某些情况下，当内置锁过于灵活时，可以使用显式锁。正如Lock是一种广义的内置锁，Condition（参见程序清单14-10）也是一种广义的内置条件队列。

程序清单14-10 Condition接口  
```java
public interface Condition {
    void await() throws InterruptedException;
    boolean await(long time, TimeUnit unit) throws InterruptedException;
    long awaitNanos(long nanosTimeout) throws InterruptedException;
    void awaitUninterruptibly();
    boolean awaitUntil(Date deadline) throws InterruptedException;
    void signal();
    void signalAll();
} 
```

内置条件队列存在一些缺陷。每个内置锁都只能有一个相关联的条件队列，因而在像 BoundedBuffer 这种类中，多个线程可能在同一个条件队列上等待不同的条件谓词，并且在最常见的加锁模式下公开条件队列对象。这些因素都使得无法满足在使用 notifyAll 时所有等待线程为同一类型的需求。如果想编写一个带有多个条件谓词的并发对象，或者想获得除了条件队列可见性之外的更多控制权，就可以使用显式的 Lock 和 Condition 而不是内置锁和条件队列，这是一种更灵活的选择。

一个 Condition 和一个 Lock 关联在一起，就像一个条件队列和一个内置锁相关联一样。要创建一个 Condition，可以在相关联的 Lock 上调用 Lock.newCondition 方法。正如 Lock 比内置加锁提供了更为丰富的功能，Condition 同样比内置条件队列提供了更丰富的功能：在每个锁上可存在多个等待、条件等待可以是可中断的或不可中断的、基于时限的等待，以及公平的或非公平的队列操作。

与内置条件队列不同的是，对于每个Lock，可以有任意数量的Condition对象。Condition对象继承了相关的Lock对象的公平性，对于公平的锁，线程会依照FIFO顺序从Conditionawait中释放。

特别注意：在Condition对象中，与wait、notify和notifyAll方法对应的分别是await、signal和signalAll。但是，Condition对Object进行了扩展，因而它也包含wait和notify方法。一定要确保使用正确的版本——await和signal。

程序清单14-11给出了有界缓存的另一种实现，即使用两个Condition，分别为notFull和notEmpty，用于表示“非满”与“非空”两个条件谓词。当缓存为空时，take将阻塞并等待

notEmpty，此时put向notEmpty发送信号，可以解除任何在take中阻塞的线程。

程序清单14-11 使用显式条件变量的有界缓存  
@ThreadSafe   
public class ConditionBoundedBuffer<T> { protected final Lock lock $=$ new ReentrantLock(); //条件谓词：notFull（count $<$ items.length) private final Condition notFull $=$ lock.newCondition(); //条件谓词：notEmpty（count $>0$ ） private final Condition notEmpty $=$ lock.newCondition(); @GuardedBy("lock") private final T[] items $=$ (T[]) new Object[BUFFER_SIZE]; @GuardedBy("lock") private int tail,head,count; //阻塞并直到：notFull   
public void put(T x) throws扰乱Exception{ lock.lock(); try{ while（count $= =$ items.length) notFull await(); items[tail] $= \mathbf{x}$ if( $+ +$ tail $= =$ items.length) tail $= 0$ ++count; notEmpty.signal(); }finally{ lock.unlock(); }   
}   
//阻塞并直到：notEmpty   
public T take() throws扰乱Exception{ lock.lock(); try{ while（count $= = 0$ ) notEmptyawait(); Tx $=$ items[head]; items[head] $= \mathrm{null}$ if( $+ +$ head $= =$ items.length) head $= 0$ --count; notFull.signal(); return x; }finally{ lock.unlock(); }

Condition BoundedBuffer 的行为和 BoundedBuffer 相同，但它对条件队列的使用方式更容易理解——在分析使用多个 Condition 的类时，比分析一个使用单一内部队列加多个条件谓词的类简单得多。通过将两个条件谓词分开并放到两个等待线程集中，Condition 使其更容易满足单次通知的需求。signal 比 signalAll 更高效，它能极大地减少在每次缓存操作中发生的上下文

切换与锁请求的次数。

与内置锁和条件队列一样，当使用显式的Lock和Condition时，也必须满足锁、条件谓词和条件变量之间的三元关系。在条件谓词中包含的变量必须由Lock来保护，并且在检查条件谓词以及调用await和signal时，必须持有Lock对象 $\Theta$ 。

在使用显式的Condition和内置条件队列之间进行选择时，与在ReentrantLock和synchronized之间进行选择是一样的：如果需要一些高级功能，例如使用公平的队列操作或者在每个锁上对应多个等待线程集，那么应该优先使用Condition而不是内置条件队列。（如果需要ReentrantLock的高级功能，并且已经使用了它，那么就已经做出了选择。）