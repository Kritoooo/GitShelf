# 8.3.5 在调用构造函数后再定制 ThreadPoolExecutor

在调用完 ThreadPoolExecutor 的构造函数后，仍然可以通过设置函数（Setter）来修改大多数传递给它的构造函数的参数（例如线程池的基本大小、最大大小、存活时间、线程工厂以及拒绝执行处理器（Rejected Execution Handler)）。如果 Executor 是通过 Executor 中的某个（newSingleThreadExecutor 除外）工厂方法创建的，那么可以将结果的类型转换为 ThreadPoolExecutor 以访问设置器，如程序清单 8-8 所示。

程序清单8-8 对通过标准工厂方法创建的 Executor 进行修改  
```javascript
ExecutorService exec = Executor.newCachedThreadPool(); if (exec instanceof ThreadPoolExecutor) ((ThreadPoolExecutor) exec).setCorePoolSize(10); else throw new AssertionError(" Oops, bad assumption"); 
```

在Executors中包含一个unconfigurableExecutorService工厂方法，该方法对一个现有的ExecutorService进行包装，使其只暴露出ExecutorService的方法，因此不能对它进行配置。newSingleThreadExecutor返回按这种方式封装的ExecutorService，而不是最初的ThreadPoolExecutor。虽然单线程的Executor实际上被实现为一个只包含唯一线程的线程池，但它同样确保了不会并发地执行任务。如果在代码中增加单线程Executor的线程池大小，那么将破坏它的执行语义。

你可以在自己的 Executor 中使用这项技术以防止执行策略被修改。如果将 ExecutorService 暴露给不信任的代码，又不希望对其进行修改，就可以通过 unconfigurableExecutorService 来包装它。