# 6.2.1 示例：基于 Executor 的 Web 服务器

基于 Executor 来构建 Web 服务器是非常容易的。在程序清单 6-4 中用 Executor 代替了硬编码的线程创建过程。在这种情况下使用了一种标准的 Executor 实现，即一个固定长度的线程池，可以容纳 100 个线程。

程序清单6-4 基于线程池的Web服务器  
```java
class TaskExecutionWebServer {
    private static final int NTHREADS = 100;
    private static final Executor exec
        = Executors.newThreadPool(NTHREADS);
    public static void main(String[] args) throws IOException {
        ServerSocket socket = new ServerSocket(80);
        while (true) {
            final Socket connection = socket.accept();
            Runnable task = new Runnable() {
                public void run() {
                    handleRequest(connection);
            }
        };
        exec.Execute(task);
    }
} 
```

在 TaskExecutionWebServer 中，通过使用 Executor，将请求处理任务的提交与任务的实际执行解耦开来，并且只需采用另一种不同的 Executor 实现，就可以改变服务器的行为。改变 Executor 实现或配置所带来的影响要远远小于改变任务提交方式带来的影响。通常，Executor 的配置是一次性的，因此在部署阶段可以完成，而提交任务的代码却会不断地扩散到整个程序中，增加了修改的难度。

我们可以很容易地将 TaskExecutionWebServer 修改为类似 ThreadPerTaskWebServer 的行为，只需使用一个为每个请求都创建新线程的 Executor。编写这样的 Executor 很简单，如程序清单 6-5 中的 ThreadPerTaskExecutor 所示。

程序清单6-5 为每个请求启动一个新线程的 Executor  
```java
public class ThreadPerTaskExecutor implements Executor { public void execute(Runnable r) { new Thread(r).start(); };   
} 
```

同样，还可以编写一个 Executor 使 TaskExecutionWebServer 的行为类似于单线程的行为，即以同步的方式执行每个任务，然后再返回，如程序清单 6-6 中的 WithinThreadExecutor 所示。

程序清单6-6 在调用线程中以同步方式执行所有任务的 Executor  
```java
public class WithinThreadExecutor implements Executor { public void execute(Runnable r) { r.run(); };   
} 
```