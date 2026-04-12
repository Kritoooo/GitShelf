# 6.2.4 Executor 的生命周期

我们已经知道如何创建一个 Executor，但并没有讨论如何关闭它。Executor 的实现通常会创建线程来执行任务。但 JVM 只有在所有（非守护）线程全部终止后才会退出。因此，如果无法正确地关闭 Executor，那么 JVM 将无法结束。

由于 Executor 以异步方式来执行任务，因此在任何时刻，之前提交任务的状态不是立即可见的。有些任务可能已经完成，有些可能正在运行，而其他的任务可能在队列中等待执行。当关闭应用程序时，可能采用最平缓的关闭形式（完成所有已经启动的任务，并且不再接受任何新的任务），也可能采用最粗暴的关闭形式（直接关掉机房的电源），以及其他各种可能的形式。既然 Executor 是为应用程序提供服务的，因而它们也是可关闭的（无论采用平缓的方式还是粗暴的方式），并将在关闭操作中受影响的任务的状态反馈给应用程序。

为了解决执行服务的生命周期问题，Executor扩展了 ExecutorService接口，添加了一些用于生命周期管理的方法（同时还有一些用于任务提交的便利方法）。在程序清单6-7中给出了 ExecutorService中的生命周期管理方法。

程序清单6-7 ExecutorService中的生命周期管理方法  
```java
public interface ExecutorService extends Executor {
    void shutdown();
    List<Runnable> shutdownNow();
    boolean isShutdown();
    boolean isTerminated();
    boolean awaitTermination(long timeout, TimeUnit unit) throws InterruptedException;
    //……其他用于任务提交的便利方法
} 
```

ExecutorService 的生命周期有 3 种状态：运行、关闭和已终止。ExecutorService 在初始创建时处于运行状态。shutdown 方法将执行平缓的关闭过程：不再接受新的任务，同时等待已经提交的任务执行完成——包括那些还未开始执行的任务。shutdownNow 方法将执行粗暴的关闭过程：它将尝试取消所有运行中的任务，并且不再启动队列中尚未开始执行的任务。

在 ExecutorService 关闭后提交的任务将由“拒绝执行处理器 (Rejected Execution Handler)”来处理（请参见 8.3.3 节），它会抛弃任务，或者使得 execute 方法抛出一个未检查的 RejectedExecutionException。等所有任务都完成后，ExecutorService 将转入终止状态。可以调用 awaitTermination 来等待 ExecutorService 到达终止状态，或者通过调用 isTerminated 来轮询 ExecutorService 是否已经终止。通常在调用 awaitTermination 之后会立即调用 shutdown，从而产生同步地关闭 ExecutorService 的效果。（第 7 章将进一步介绍 Executor 的关闭和任务取消等方面的内容。）

程序清单6-8的LifecycleWebServer通过增加生命周期支持来扩展Web服务器的功能。可以通过两种方法来关闭Web服务器：在程序中调用stop，或者以客户端请求形式向Web服务器发送一个特定格式的HTTP请求。

程序清单6-8 支持关闭操作的Web服务器  
```java
class LifecycleWebServer {
    private final ExecutorService exec = ...;
    public void start() throws IOException {
        ServerSocket socket = new ServerSocket(80); 
```

while (!exec.isShutdown()) { try { final Socket conn = socket.accept(); exec.execute(new Runnable() { public void run() {希望大家执行（RejectedExecutionException e）{ if(!exec.isShutdown()) log("task submission rejected",e); } } } public void stop(){ exec.shutdown(); } voidquiriesocketconnection){ Request req $=$ readRequest(connection); if(isShutdownRequest(req)) stop(); else dispatchRequestreq); }