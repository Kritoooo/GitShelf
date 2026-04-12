# 程序清单8-5 ThreadFactory接口

```txt
public interface ThreadFactory { Thread newThread(Runnable r); } 
```

在程序清单8-6的MyThreadFactory中给出了一个自定义的线程工厂。它创建了一个新的MyAppThread实例，并将一个特定于线程池的名字传递给MyAppThread的构造函数，从而可以在线程转储和错误日志信息中区分来自不同线程池的线程。在应用程序的其他地方也可以使用MyAppThread，以便所有线程都能使用它的调试功能。