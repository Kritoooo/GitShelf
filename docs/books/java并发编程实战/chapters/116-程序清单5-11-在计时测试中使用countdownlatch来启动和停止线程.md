# 程序清单5-11 在计时测试中使用CountDownLatch来启动和停止线程

```java
public long timeTasks(int nThreads, final Runnable task) throws InterruptedException { final CountDownLatch startGate = new CountDownLatch(1); final CountDownLatch endGate = new CountDownLatch(nThreads); for (int i = 0; i < nThreads; i++) { Thread t = new Thread() { public void run() { try { startGate await(); try { task.run(); } finally { endGate.countDown(); } } catch (InterruptedException ignored) { } }; t.start(); } long start = System.nanoTime(); startGate.countDown(); endGate await(); long end = System.nanoTime(); return end-start; } 
```

为什么要在 TestHarness 中使用闭锁，而不是在线程创建后就立即启动？或许，我们希望测试 n 个线程并发执行某个任务时需要的时间。如果在创建线程后立即启动它们，那么先启动的线程将“领先”后启动的线程，并且活跃线程数量会随着时间的推移而增加或减少，竞争程度也在不断发生变化。启动门将使得主线程能够同时释放所有工作线程，而结束门则使主线程能够等待最后一个线程执行完成，而不是顺序地等待每个线程执行完成。