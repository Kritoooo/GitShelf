# 6.3.2 携带结果的任务Callable与Future

Executor 框架使用 Runnable 作为其基本的任务表示形式。Runnable 是一种有很大局限的抽象，虽然 run 能写入到日志文件或者将结果放入某个共享的数据结构，但它不能返回一个值或抛出一个受检查的异常。

许多任务实际上都是存在延迟的计算——执行数据库查询，从网络上获取资源，或者计算某个复杂的功能。对于这些任务，Callable 是一种更好的抽象：它认为主入口点（即 call）将返回一个值，并可能抛出一个异常。 $\Theta$ 在 Executor 中包含了一些辅助方法能将其他类型的任务封装为一个 Callable，例如 Runnable 和 java.security.PrivilegedAction。

ifiable 和 Callable 描述的都是抽象的计算任务。这些任务通常是有范围的，即都有一个明确的起始点，并且最终会结束。Executor 执行的任务有 4 个生命周期阶段：创建、提交、开始和完成。由于有些任务可能要执行很长的时间，因此通常希望能够取消这些任务。在 Executor 框架中，已提交但尚未开始的任务可以取消，但对于那些已经开始执行的任务，只有当它们能响应中断时，才能取消。取消一个已经完成的任务不会有任何影响。（第 7 章将进一步介绍取消操作。）

Future 表示一个任务的生命周期，并提供了相应的方法来判断是否已经完成或取消，以及获取任务的结果和取消任务等。在程序清单 6-11 中给出了 Callable 和 Future。在 Future 规范中包含的隐含意义是，任务的生命周期只能前进，不能后退，就像 ExecutorService 的生命周期一样。当某个任务完成后，它就永远停留在“完成”状态上。

get 方法的行为取决于任务的状态（尚未开始、正在运行、已完成）如果任务已经完成，

那么 get 会立即返回或者抛出一个 Exception，如果任务没有完成，那么 get 将阻塞并直到任务完成。如果任务抛出了异常，那么 get 将该异常封装为 ExecutionException 并重新抛出。如果任务被取消，那么 get 将抛出 CancellationException。如果 get 抛出了 ExecutionException，那么可以通过 getCause 来获得被封装的初始异常。

程序清单6-11 Callable与Future接口  
```typescript
public interface Callable<V> {
    V call() throws Exception;
} 
```

可以通过许多种方法创建一个Future来描述任务。ExecutorService中的所有submit方法都将返回一个Future，从而将一个Runnable或Callable提交给Executor，并得到一个Future用来获得任务的执行结果或者取消任务。还可以显式地为某个指定的Runnable或Callable实例化一个FutureTask。（由于FutureTask实现了Runnable，因此可以将它提交给Executor来执行，或者直接调用它的run方法。）

从Java 6开始，ExecutorService实现可以改写AbstractExecutorService中的newTaskFor方法，从而根据已提交的Runnable或Callable来控制Future的实例化过程。在默认实现中仅创建了一个新的FutureTask，如程序清单6-12所示。

程序清单6-12 ThreadPoolExecutor中newTaskFor的默认实现   
```java
protected<T> RunnableFuture<T> newTaskFor(Callable<T> task) {
    return new FutureTask<T>(task);
} 
```

在将 Runnable 或 Callable 提交到 Executor 的过程中，包含了一个安全发布过程（请参见 3.5 节），即将 Runnable 或 Callable 从提交线程发布到最终执行任务的线程。类似地，在设置 Future 结果的过程中也包含了一个安全发布，即将这个结果从计算它的线程发布到任何通过 get 获得它的线程。