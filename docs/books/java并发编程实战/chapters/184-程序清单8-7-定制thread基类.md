# 程序清单8-7 定制Thread基类

```java
public class MyAppThread extends Thread { public static final String DEFAULT_NAME = "MyAppThread"; private static volatile boolean debugLifecycle = false; private static final AtomicInteger created = new AtomicInteger(); 
```

private static final AtomicInteger alive $=$ new AtomicInteger(); private static final Logger log $=$ Logger.getAnonymousLogger(); public MyAppThread( Runnable r){ this(r,DEFAULT_NAME); } public MyAppThread( Runnable runnable, String name){ super runnable, name $^+$ "-" $^+$ created.incrementAndGet(); setUncaughtExceptionHandler( new Thread.UncaughtExceptionHandler(){ public void uncaughtException( Thread t,Throwable e){ log.log(Level.SEVERE, "UNCAUGHT in thread" $^+$ t.getName(),e); 1 1）;   
public void run() { //复制debug标志以确保一致的值 boolean debug $=$ debugLifecycle; if (debug) log.log(Level.FINE, "Created "+getName(); try{ alive.incrementAndGet(); super.run(); }finally{ alive.decrementAndGet(); if (debug) log.log(Level.FINE, "Exiting"+getName(); }   
public static int getThreadsCreated(){ return created.get();} public static int getThreadsAlive(){ return alive.get();} public static boolean getDebug(){ return debugLifecycle; } public static void setDebug(boolean b){ debugLifecycle $\equiv$ b;}

如果在应用程序中需要利用安全策略来控制对某些特殊代码库的访问权限，那么可以通过 Executor 中的 privilegedThreadFactory 工厂来定制自己的线程工厂。通过这种方式创建出来的线程，将与创建 privilegedThreadFactory 的线程拥有相同的访问权限、AccessControlContext 和 contextClassLoader。如果不使用 privilegedThreadFactory，线程池创建的线程将从在需要新线程时调用 execute 或 submit 的客户程序中继承访问权限，从而导致令人困惑的安全性异常。