# 14.6.2 Semaphore与CountDownLatch

Semaphore将AQS的同步状态用于保存当前可用许可的数量。tryAcquireShared方法（请参见程序清单14-16）首先计算剩余许可的数量，如果没有足够的许可，那么会返回一个值表示获取操作失败。如果还有剩余的许可，那么tryAcquireShared会通过compareAndSetState以原子方式来降低许可的计数。如果这个操作成功（这意味着许可的计数自从上一次读取后就没有被修改过），那么将返回一个值表示获取操作成功。在返回值中还包含了表示其他共享获取操作能否成功的信息，如果成功，那么其他等待的线程同样会解除阻塞。

程序清单14-16Semaphore中的tryAcquireShared与tryReleaseShared  
protected int tryAcquireShared(int acquires) { while(true){ int available $=$ getState(); int remaining $=$ available - acquires; if (remaining $<  0$ {| compareAndSetState(available, remaining)) return remaining; }   
}   
protected boolean tryReleaseShared(int releases) { while(true){ int $\mathfrak{p} =$ getState(); if (compareAndSetState(p,p+releases)) return true; }

当没有足够的许可，或者当tryAcquireShared可以通过原子方式来更新许可的计数以响应获取操作时，while循环将终止。虽然对compareAndSetState的调用可能由于与另一个线程发生竞争而失败（请参见15.3节），并使其重新尝试，但在经过了一定次数的重试操作以后，在这两个结束条件中有一个会变为真。同样，tryReleaseShared将增加许可计数，这可能会解除等待中线程的阻塞状态，并且不断地重试直到更新操作成功。tryReleaseShared的返回值表示在这次释放操作中解除了其他线程的阻塞。

CountDownLatch 使用 AQS 的方式与Semaphore 很相似：在同步状态中保存的是当前的计数值。countDown 方法调用 release，从而导致计数值递减，并且当计数值为零时，解除所有等待线程的阻塞。await 调用 acquire，当计数器为零时，acquire 将立即返回，否则将阻塞。