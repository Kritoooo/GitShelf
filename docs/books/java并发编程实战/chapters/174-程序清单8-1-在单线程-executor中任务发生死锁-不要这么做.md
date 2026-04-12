# 程序清单8-1 在单线程 Executor中任务发生死锁（不要这么做）

```java
public class ThreadDeadlock { ExecutorService exec = Executors.newSingleThreadExecutor(); public class RenderPageTask implements Callable<String> { public String call() throws Exception { 
```

![](../images/7bdc993dd570ffb6965421820a6b9e459b38c3218c231a3bafe3e030cd99a492.jpg)

Future<String> header, footer;header $=$ exec.submit(new LoadFileTask("footer.html"));footer $=$ exec.submit(new LoadFileTask("footer.html"));String page $=$ renderBody();//将发生死锁——由于任务在等待子任务的结果return header.get() $^+$ page $^+$ footer.get();1

每当提交了一个有依赖性的 Executor 任务时，要清楚地知道可能会出现线程“饥饿”死锁，因此需要在代码或配置 Executor 的配置文件中记录线程池的大小限制或配置限制。

除了在线程池大小上的显式限制外，还可能由于其他资源上的约束而存在一些隐式限制。如果应用程序使用一个包含10个连接的JDBC连接池，并且每个任务需要一个数据库连接，那么线程池就好像只有10个线程，因为当超过10个任务时，新的任务需要等待其他任务释放连接。