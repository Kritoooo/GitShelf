# 7.2.5 shutdownNow 的局限性

当通过 shutdownNow 来强行关闭 ExecutorService 时，它会尝试取消正在执行的任务，并返回所有已提交但尚未开始的任务，从而将这些任务写入日志或者保存起来以便之后进行处理。

然而，我们无法通过常规方法来找出哪些任务已经开始但尚未结束。这意味着我们无法在关闭过程中知道正在执行的任务的状态，除非任务本身会执行某种检查。要知道哪些任务还没有完成，你不仅需要知道哪些任务还没有开始，而且还需要知道当 Executor 关闭时哪些任务正在执行。

在程序清单7-21的TrackingExecutor中给出了如何在关闭过程中判断正在执行的任务。通过封装 ExecutorService 并使得 execute（类似地还有 submit，在这里没有给出）记录哪些任务是在关闭后取消的，TrackingExecutor 可以找出哪些任务已经开始但还没有正常完成。在 Executor 结束后，getCancelledTasks 返回被取消的任务清单。要使这项技术能发挥作用，任务在返回时必须维持线程的中断状态，在所有设计良好的任务中都会实现这个功能。

程序清单7-21 在ExecutorService中跟踪在关闭之后被取消的任务  
```java
public class TrackingExecutor extends AbstractExecutorService { private final ExecutorService exec; private final Set<Runnable> tasksCancelledAtShutdown = 
```

$\ominus$ shutdownNow返回的Runnable对象可能与提交给ExecutorService的Runnable对象并不相同：它们可能是被封装过的已提交任务。  
然而，在关闭过程中只会返回尚未开始的任务，而不会返回正在执行的任务。如果能返回所有这两种类型的任务，那么就不需要这种不确定的中间状态。

```java
Collections.synchronizedSet(newHashSet<Runnable>();   
public List<Runnable> getCancelledTasks() { if (!exec.isTerminated()) throw newIllegalStateExceptionException(...); return new ArrayList<Runnable>(tasksCancelledAtShutdown);   
public void execute(final Runnable runnable) { exec.execute(new Runnable() { public void run() { try { runnable.run(); }finally{ if (isShutdown() && Thread.currentThread().interrupted()) tasksCancelledAtShutdown.add runnable); } } }）;   
//将ExecutorService的其他方法委托给exec 
```

在程序清单 7-22 的 WebCrawler 中给出了 TrackingExecutor 的用法。网页爬虫程序的工作通常是无穷尽的，因此当爬虫程序必须关闭时，我们通常希望保存它的状态，以便稍后重新启动。CrawlTask 提供了一个 getPage 方法，该方法能找出正在处理的页面。当爬虫程序关闭时，无论是还没有开始的任务，还是那些被取消的任务，都将记录它们的 URL，因此当爬虫程序重新启动时，就可以将这些 URL 的页面抓取任务加入到任务队列中。

程序清单7-22 使用TrackingExecutorService来保存未完成的任务以备后续执行  
```java
public abstract class WebCrawler { private volatile TrackingExecutor exec; @GuardedBy("this") private final Set<URL> urlsToCrawl = newHashSet<URL>(); public synchronized void start() { exec = new TrackingExecutor( Executors.newCachedThreadPool()); for (URL url : urlsToCrawl) submitCrawlTask(url); URLsToCrawl.clear(); } public synchronized void stop() throws InterruptedException { try { saveUncrawled exec.shutdownNow()); if (exec awaitTermination(TIMEOUT, UNIT)) saveUncrawled exec.getCancelledTasks()); } finally { 
```

```java
exec = null;
}
}
protected abstract List<URL> processPage(URL url);
private void saveUncrawled(List<Runnable> uncrawled) {
    for (Runnable task : uncrawled)
       UrlstoCrawl.add(((CrawlTask) task).getPage());
}
private void submitCrawlTask(URL u) {
    exec.execute(new CrawlTask(u));
}
private class CrawlTask implements Runnable {
    private final URL url;
    ...
    public void run() {
        for (URL link : processPage(url)) {
            if (Thread.currentThread().isInterrupted())
                return;
            submitCrawlTask(link);
        }
    }
    public URL getPage() { return url; }
} 
```

在TrackingExecutor中存在一个不可避免的竞态条件，从而产生“误报”问题：一些被认为已取消的任务实际上已经执行完成。这个问题的原因在于，在任务执行最后一条指令以及线程池将任务记录为“结束”的两个时刻之间，线程池可能被关闭。如果任务是幂等的（Idempotent，即将任务执行两次与执行一次会得到相同的结果），那么这不会存在问题，在网页爬虫程序中就是这种情况。否则，在应用程序中必须考虑这种风险，并对“误报”问题做好准备。