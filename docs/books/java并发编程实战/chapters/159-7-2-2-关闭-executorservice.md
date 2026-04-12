# 7.2.2 关闭 ExecutorService

在6.2.4节中，我们看到ExecutorService提供了两种关闭方法：使用shutdown正常关闭，以及使用shutdownNow强行关闭。在进行强行关闭时，shutdownNow首先关闭当前正在执行的任务，然后返回所有尚未启动的任务清单。

这两种关闭方式的差别在于各自的安全性和响应性：强行关闭的速度更快，但风险也更大，因为任务很可能在执行到一半时被结束；而正常关闭虽然速度慢，但却更安全，因为 ExecutorService 会一直等到队列中的所有任务都执行完成后才关闭。在其他拥有线程的服务中也应该考虑提供类似的关闭方式以供选择。

简单的程序可以直接在 main 函数中启动和关闭全局的 ExecutorService。而在复杂程序中，通常会将 ExecutorService 封装在某个更高级别的服务中，并且该服务能提供其自己的生命周期方法，例如程序清单 7-16 中 LogService 的一种变化形式，它将管理线程的工作委托给一个 ExecutorService，而不是由其自行管理。通过封装 ExecutorService，可以将所有权链（Ownership Chain）从应用程序扩展到服务以及线程，所有权链上的各个成员都将管理它所拥有的服务或线程的生命周期。

程序清单7-16 使用ExecutorService的日志服务  
public class LogService { private final ExecutorService exec $=$ newSingleThreadExecutor(); public void start() { public void stop() throws扰乱Exception { try{ exec.shutdown(); exec awaitTermination(TIMEOUT, UNIT); }finally{

```java
writer.close(); } } public void log(String msg) { try { exec.execute(new WriteTask(msg)); } catch (RejectedExecutionException ignored) { } } 
```