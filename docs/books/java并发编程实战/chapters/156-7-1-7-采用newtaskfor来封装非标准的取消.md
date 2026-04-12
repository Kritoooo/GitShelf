# 7.1.7 采用newTaskFor来封装非标准的取消

我们可以通过newTaskFor方法来进一步优化ReaderThread中封装非标准取消的技术，这

是Java 6在ThreadPoolExecutor中的新增功能。当把一个Callable提交给ExecutorService时，submit方法会返回一个Future，我们可以通过这个Future来取消任务。newTaskFor是一个工厂方法，它将创建Future来代表任务。newTaskFor还能返回一个RunnableFuture接口，该接口扩展了Future和Runnable（并由FutureTask实现）。

通过定制表示任务的Future可以改变Future.cancel的行为。例如，定制的取消代码可以实现日志记录或者收集取消操作的统计信息，以及取消一些不响应中断的操作。通过改写interrupt方法，ReaderThread可以取消基于套接字的线程。同样，通过改写任务的Future Cancel方法也可以实现类似的功能。

在程序清单7-12的CancellableTask中定义了一个CancellableTask接口，该接口扩展了Callable，并增加了一个cancel方法和一个newTask工厂方法来构造RunnableFuture。CancellingExecutor扩展了ThreadPoolExecutor，并通过改写newTaskFor使得CancellableTask可以创建自己的Future。

程序清单7-12 通过newTaskFor将非标准的取消操作封装在一个任务中  
```java
public interface CancellableTask<T> extends Callable<T> {
    void cancel();
    RunnableFuture<T> newTask();
} @ThreadSafe
public class CancellationExecutor extends ThreadPoolExecutor {
    ...
        protected<T> RunnableFuture<T> newTaskFor(Callable<T> callable) {
            if (callable instanceof CancellableTask)
                return ((CancellableTask<T>) callable).newTask();
            else
                return super.newTaskFor(callable);
        }
} 
```

```txt
return super.cancel (mayInterruptIfRunning); } } 1 1 1 1 1 1 1 1 1 
```

SocketUsingTask 实现了 CancellableTask，并定义了 Future.cancel 来关闭套接字和调用 super.cancel。如果 SocketUsingTask 通过其自己的 Future 来取消，那么底层的套接字将被关闭并且线程将被中断。因此它提高了任务对取消操作的响应性：不仅能够在调用可中断方法的同时确保响应取消操作，而且还能调用可阻调的套接字 I/O 方法。