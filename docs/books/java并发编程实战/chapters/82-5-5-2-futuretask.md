# 5.5.2 FutureTask

FutureTask也可以⽤做闭锁。（FutureTask实现了Future语义，表⽰⼀种抽象的可⽣成结果的计算[CPJ 4.3.3]）。FutureTask表⽰的计算是通过Callable来实现的，相当于⼀种可⽣成结果的Runnable，并且可以处于以下3种状态：等待运⾏（Waiting to run），正在运⾏（Running）和运⾏完成（Completed）。“执⾏完成”表⽰计算的所有可能结束⽅式，包括正常结束、由于取消⽽结束和由于异常⽽结束等。当FutureTask进⼊完成状态后，它会永远停⽌在这个状态上。

Future. get的⾏为取决于任务的状态。如果任务已经完成，那么get会⽴即返回结果，否则get将阻塞直到任务进⼊完成状态，然后返回结果或者抛出异常。FutureTask将计算结果从执⾏计算的线程传递到获取这个结果的线程，⽽FutureTask的规范确保了这种传递过程能实现结果的安全发布。

FutureTask在Executor框架中表⽰异步任务，此外还可以⽤来表⽰⼀些时间较⻓的计算，这些计算可以在使⽤计算结果之前启动。程序清单5-12中的Preloader就使⽤了FutureTask来执⾏⼀个⾼开销的计算，并且计算结果将在稍后使⽤。通过提前启动计算，可以减少在等待结果时需要的时间。

**程序清单5-12 使⽤FutureTask来提前加载稍后需要的数据**

```java
public class Preloader{   
private final FutureTask<ProductInfo>future=   
new FutureTask<ProductInfo> (new Callable<ProductInfo> () {   
public ProductInfo call() throws DataLoadException{ 
```

return loadProductInfo();   
}   
}）;   
private final Thread thread $\equiv$ new Thread (future) ; public void start（{thread.start（）；}   
public ProductInfo get()   
throws DataLoadException，InterruptedException{ try{ return future.get(); }catch（ExecutionException e）{Throwable cause $\equiv$ e.getCause(); if（cause instanceof DataLoadException) throw（DataLoadException）cause; else throw launderThrowable（cause）;   
}

Preloader创建了⼀个FutureTask，其中包含从数据库加载产品信息的任务，以及⼀个执⾏运算的线程。由于在构造函数或静态初始化⽅法中

启动线程并不是⼀种好⽅法，因此提供了⼀个start⽅法来启动线程。当程序随后需要ProductInfo时，可以调⽤get⽅法，如果数据已经加载，那么将返回这些数据，否则将等待加载完成后再返回。

Callable表⽰的任务可以抛出受检查的或未受检查的异常，并且任何代码都可能抛出⼀个Error。⽆论任务代码抛出什么异常，都会被封装到⼀个ExecutionException中，并在Future.get中被重新抛出。这将使调⽤get的代码变得复杂，因为它不仅需要处理可能出现的

ExecutionException（以及未检查的CancellationException），⽽且还由于ExecutionException是作为⼀个Throwable类返回的，因此处理起来并不容易。

在Preloader中，当get⽅法抛出ExecutionException时，可能是以下三种情况之⼀：Callable抛出的受检查异常，RuntimeException，以及Error。我们必须对每种情况进⾏单独处理，但我们将使⽤程序清单5-13中的launderThrowable辅助⽅法来封装⼀些复杂的异常处理逻辑。在调⽤launderThrowable之前，Preloader会⾸先检查已知的受检查异常，并重新抛出它们。剩下的是未检查异常，Preloader将调⽤launderThrowable并抛出结果。如果Throwable传递给launderThrowable的是⼀个Error，那么launderThrowable将直接再次抛出它；如果不是RuntimeException，那么将抛出⼀个IllegalStateException表⽰这是⼀个逻辑错误。剩下的RuntimeException, launderThrowable将把它们返回给调⽤者，⽽调⽤者通常会重新抛出它们。

程序清单5-13 强制将未检查的Throwable转换为RuntimeException

/**如果Throwable是Error，那么抛出它；如果是RuntimeException，那么返回它，否则抛出

IllegalStateException。*/

public static RuntimeException launderThrowable（Throwable t）{

if（t instanceof RuntimeException）

return（RuntimeException）t；

else if（t instanceof Error）

throw（Error）t；

else

throw new IllegalStateException（"Not unchecked"，t）；

}

**读累了记得休息⼀会哦~**

**公众号：古德猫宁李**

电⼦书搜索下载  
书单分享   
书友学习交流

⽹站：沉⾦书屋 https://www.chenjin5.com

电⼦书搜索下载  
电⼦书打包资源分享  
学习资源分享

**Table of Contents**

**对本书的赞誉**

**译者序**

**前⾔**

**第1章简介**

1.1 并发简史  
1.2 线程的优势

1.2.1 发挥多处理器的强⼤能⼒  
1.2.2 建模的简单性  
1.2.3 异步事件的简化处理  
1.2.4 响应更灵敏的⽤户界⾯

1.3 线程带来的⻛险

1.3.1 安全性问题  
1.3.2 活跃性问题  
1.3.3 性能问题

1.4 线程⽆处不在

**第⼀部分 基础知识**

**第2章线程安全性**

2.1 什么是线程安全性  
2.2 原⼦性

2.2.1 竞态条件  
2.2.2 ⽰例：延迟初始化中的竞态条件  
2.2.3 复合操作

2.3 加锁机制

2.3.1 内置锁  
2.3.2 重⼊  
2.4 ⽤锁来保护状态  
2.5 活跃性与性能

**第3章对象的共享**

3.1 可⻅性

3.1.1 失效数据  
3.1.2 ⾮原⼦的64位操作  
3.1.3 加锁与可⻅性  
3.1.4 Volatile变量

**3.2 发布与逸出**

**3.3 线程封闭**

3.3.1 Ad-hoc线程封闭   
3.3.2 栈封闭   
3.3.3 ThreadLocal类

**3.4 不变性**

3.4.1 Final域  
3.4.2 ⽰例：使⽤Volatile类型来发布不可变对象

**3.5 安全发布**

3.5.1 不正确的发布：正确的对象被破坏  
3.5.2 不可变对象与初始化安全性  
3.5.3 安全发布的常⽤模式  
3.5.4 事实不可变对象  
3.5.5 可变对象  
3.5.6 安全地共享对象

**第4章对象的组合**

**4.1 设计线程安全的类**

4.1.1 收集同步需求  
4.1.2 依赖状态的操作  
4.1.3 状态的所有权

**4.2 实例封闭**

4.2.1 Java监视器模式  
4.2.2 ⽰例：⻋辆追踪

**4.3 线程安全性的委托**

4.3.1 ⽰例：基于委托的⻋辆追踪器  
4.3.2 独⽴的状态变量  
4.3.3 当委托失效时  
4.3.4 发布底层的状态变量  
4.3.5 ⽰例：发布状态的⻋辆追踪器

**4.4 在现有的线程安全类中添加功能**

4.4.1 客户端加锁机制

4.4.2 组合

**4.5 将同步策略⽂档化**

**第5章基础构建模块**

**5.1 同步容器类**

5.1.1 同步容器类的问题  
5.1.2 迭代器与 ConcurrentModificationE xception   
5.1.3 隐藏迭代器

**5.2 并发容器**

5.2.1 ConcurrentHashMap   
5.2.2 额外的原⼦Map操作  
5.2.3 CopyOnWriteArrayList

**5.3 阻塞队列和⽣产者-消费者模式**

5.3.1 ⽰例：桌⾯搜索   
5.3.2 串⾏线程封闭   
5.3.3 双端队列与⼯作密取

5.4 阻塞⽅法与中断⽅法  
5.5 同步⼯具类

5.5.1 闭锁   
5.5.2 FutureTask

**第⼆部分 结构化并发应⽤程序**

第6章 任务执⾏  
第7章取消与关闭  
第8章线程池的使⽤  
第9章 图形⽤户界⾯应⽤程序

**第三部分活跃性、性能与测试**

第10章避免活跃性危险  
第11章性能与可伸缩性  
第12章并发程序的测试

**第四部分⾼级主题**

第13章显式锁  
第14章构建⾃定义的同步⼯具  
第15章原⼦变量与⾮阻塞同步机制  
第16章 Java内存模型