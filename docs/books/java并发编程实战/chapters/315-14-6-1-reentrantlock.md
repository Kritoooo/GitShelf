# 14.6.1 ReentrantLock

ReentrantLock 只支持独占方式的获取操作，因此它实现了 tryAcquire、tryRelease 和 isHeldExclusively，程序清单 14-15 给出了非公平版本的 tryAcquire。ReentrantLock 将同步状态用于保存锁获取操作的次数，并且还维护一个 owner 变量来保存当前所有者线程的标识符，只有在当前线程刚刚获取到锁，或者正要释放锁的时候，才会修改这个变量。在 tryRelease 中检查 owner 域，从而确保当前线程在执行 unlock 操作之前已经获取了锁：在 tryAcquire 中将使用这个域来区分获取操作是重入的还是竞争的。

程序清单14-15 基于非公平的ReentrantLock实现tryAcquire  
```java
protected boolean tryAcquire(int ignored) {
    final Thread current = Thread.currentThread();
    int c = getCurrent(); 
    if (c == 0) {
        if (compareAndSetState(0, 1)) { 
```

也可以从http://gee.cs.oswego.edu/dl/concurrency-interest获得，只是存在一些许可限制。  
由于受保护的状态操作方法具有 volatile 类型的内存读写语义，同时 ReentrantLock 只是在调用 getState 之后才会读取 owner 域，并且只有在调用 setState 之前才会写入 owner，因此 ReentrantLock 可以拥有同步状态的内存语义，因此避免了进一步的同步（请参见 16.1.4 节）。

owner $=$ current; return true; } } else if (current $\equiv$ owner){ setState(c+1); return true; } return false;

当一个线程尝试获取锁时，tryAcquire将首先检查锁的状态。如果锁未被持有，那么它将尝试更新锁的状态以表示锁已经被持有。由于状态可能在检查后被立即修改，因此tryAcquire使用compareAndSetState来原子地更新状态，表示这个锁已经被占有，并确保状态在最后一次检查以后就没有被修改过。（请参见15.3节中对compareAndSet的描述）。如果锁状态表明它已经被持有，并且如果当前线程是锁的拥有者，那么获取计数会递增，如果当前线程不是锁的拥有者，那么获取操作将失败。

ReentrantLock 还利用了 AQS 对多个条件变量和多个等待线程集的内置支持。Lock.newCondition 将返回一个新的 ConditionObject 实例，这是 AQS 的一个内部类。