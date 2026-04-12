# 14.4 Synchronizer 剖析

在ReentrantLock和Semaphore这两个接口之间存在许多共同点。这两个类都可以用做一个“阀门”，即每次只允许一定数量的线程通过，并当线程到达阀门时，可以通过（在调用lock或acquire时成功返回），也可以等待（在调用lock或acquire时阻塞），还可以取消（在调用tryLock或tryAcquire时返回“假”，表示在指定的时间内锁是不可用的或者无法获得许可）。而且，这两个接口都支持可中断的、不可中断的以及限时的获取操作，并且也都支持等待线程执行公平或非公平的队列操作。

列出了这种共性后，你或许会认为Semaphore 是基于 ReentrantLock 实现的，或者认为 ReentrantLock 实际上是带有一个许可的Semaphore。这些实现方式都是可行的，一个很常见的练习就是，证明可以通过锁来实现计数信号量（如程序清单 14-12 中的SemaphoreOnLock 所示），以及可以通过计数信号量来实现锁。

程序清单14-12 使用Lock来实现信号量  
```java
// 并非java.util.concurrent.Semaphore的真实实现方式
@ThreadSafe
public classSemaphoreOnLock {
    private final Lock lock = new ReentrantLock();
    // 条件谓词：permitsAvailable (permits > 0)
    private final Condition permitsAvailable = lock.newCondition();
    @GuardedBy("lock") private int permits;
   SemaphoreOnLock(int initialPermits) {
        lock.lock();
        try {
            permits = initialPermits;
        } finally {
            lock.unlock();
        }
    }
} 
```

lock.lock(); try { while (permits $<  =$ 0) permitsAvailableawait(); --perms; }finally{ lock.unlock(); } } public void release() { lock.lock(); try { ++perms; permitsAvailable(signal); }finally{ lock.unlock(); } } }

事实上，它们在实现时都使用了一个共同的基类，即 AbstractQueuedSynchronizer(AQS)，这个类也是其他许多同步类的基类。AQS 是一个用于构建锁和同步器的框架，许多同步器都可以通过 AQS 很容易并且高效地构造出来。不仅 ReentrantLock 和Semaphore 是基于 AQS 构建的，还包括 CountDownLatch、ReentrantReadWriteLock、SynchronousQueue 和 FutureTask。

AQS解决了在实现同步器时涉及的大量细节问题，例如等待线程采用FIFO队列操作顺序。在不同的同步器中还可以定义一些灵活的标准来判断某个线程是应该通过还是需要等待。

基于AQS来构建同步器能带来许多好处。它不仅能极大地减少实现工作，而且也不必处理在多个位置上发生的竞争问题（这是在没有使用AQS来构建同步器时的情况）。在SemaphoreOnLock中，获取许可的操作可能在两个时刻阻塞——当锁保护信号量状态时，以及当许可不可用时。在基于AQS构建的同步器中，只可能在一个时刻发生阻塞，从而降低上下文切换的开销，并提高吞吐量。在设计AQS时充分考虑了可伸缩性，因此java.util.concurrent中所有基于AQS构建的同步器都能获得这个优势。