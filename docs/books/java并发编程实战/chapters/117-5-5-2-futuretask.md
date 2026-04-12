# 5.5.2 FutureTask

FutureTask 也可以用做闭锁。（FutureTask 实现了 Future 语义，表示一种抽象的可生成结果的计算 [CPJ 4.3.3]）。FutureTask 表示的计算是通过 Callable 来实现的，相当于一种可生成结果的 Runnable，并且可以处于以下 3 种状态：等待运行（Waiting to run），正在运行（Running）和运行完成（Completed）。“执行完成”表示计算的所有可能结束方式，包括正常结束、由于取消而结束和由于异常而结束等。当 FutureTask 进入完成状态后，它会永远停止在这个状态上。

Future.get 的行为取决于任务的状态。如果任务已经完成，那么 get 会立即返回结果，否则 get 将阻塞直到任务进入完成状态，然后返回结果或者抛出异常。FutureTask 将计算结果从执行计算的线程传递到获取这个结果的线程，而 FutureTask 的规范确保了这种传递过程能实现结果的安全发布。

FutureTask 在 Executor 框架中表示异步任务，此外还可以用来表示一些时间较长的计算，这些计算可以在使用计算结果之前启动。程序清单 5-12 中的 Preloader 就使用了 FutureTask 来执行一个高开销的计算，并且计算结果将在稍后使用。通过提前启动计算，可以减少在等待结果时需要的时间。

程序清单5-12 使用FutureTask来提前加载稍后需要的数据  
```java
public class Preloader {
    private final FutureTask<產品Info> future = new FutureTask<產品Info>(new Callable<產品Info>) {
        public ProductInfo call() throws DataLoadException {
            return loadProductInfo();
        }
    );
    private final Thread thread = new Thread(future);
    public void start() { thread.start(); }
    public ProductInfo get()
        throws DataLoadException,扰乱Exception {
            try {
                return future.get();
            } catch (ExecutionException e) {
               Throwable cause = e getCause();
                if (cause instanceof DataLoadException) throw (DataLoadException) cause;
                else
                    throw launderable(cause);
            }
        }
} 
```

Preloader 创建了一个 FutureTask，其中包含从数据库加载产品信息的任务，以及一个执行运算的线程。由于在构造函数或静态初始化方法中启动线程并不是一种好方法，因此提供了一个 start 方法来启动线程。当程序随后需要 ProductInfo 时，可以调用 get 方法，如果数据已经加载，那么将返回这些数据，否则将等待加载完成后再返回。

Callable表示的任务可以抛出受检查的或未受检查的异常，并且任何代码都可能抛出一个Error。无论任务代码抛出什么异常，都会被封装到一个ExecutionException中，并在Future.get中被重新抛出。这将使调用get的代码变得复杂，因为它不仅需要处理可能出现的ExecutionException（以及未检查的CancellationException），而且还由于ExecutionException是作为一个Throwable类返回的，因此处理起来并不容易。

在 Preloader 中，当 get 方法抛出 ExecutionException 时，可能是以下三种情况之一：Callable 抛出的受检查异常，RuntimeException，以及 Error。我们必须对每种情况进行单独处理，但我们将使用程序清单 5-13 中的 LAnderThrowable 辅助方法来封装一些复杂的异常处理逻辑。在调用 LAnderThrowable 之前，Preloader 会首先检查已知的受检查异常，并重新抛出它们。剩下的是未检查异常，Preloader 将调用 LAnderThrowable 并抛出结果。如果Throwable 传递给

launterThrowable 的是一个 Error，那么 launterThrowable 将直接再次抛出它；如果不是 RuntimeException，那么将抛出一个 IllegalStateException 表示这是一个逻辑错误。剩下的 RuntimeException，launterThrowable 将把它们返回给调用者，而调用者通常会重新抛出它们。

程序清单5-13 强制将未检查的Throwable 转换为 RuntimeException  
```javascript
/\*\*如果Throwable 是 Error，那么抛出它；如果是 RuntimeException，那么返回它，否则抛出   
throws   
public static.RuntimeException launderThrowable(Throwable t) { if (t instanceof."<brutenException> return （RuntimeException）t; else if(t instanceofError) throw（Error)t; else throw new IllegalStateExceptionException("Not unchecked"，t); } 
```