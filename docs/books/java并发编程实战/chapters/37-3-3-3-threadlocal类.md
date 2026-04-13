# 3.3.3 ThreadLocal类

维持线程封闭性的⼀种更规范⽅法是使⽤ThreadLocal，这个类能使线程中的某个值与保存值的对象关联起来。ThreadLocal提供了get与set等访问接⼝或⽅法，这些⽅法为每个使⽤该变量的线程都存有⼀份独⽴的副本，因此get总是返回由当前执⾏线程在调⽤set时设置的最新值。

ThreadLocal对象通常⽤于防⽌对可变的单实例变量（Singleton）或全局变量进⾏共享。例如，在单线程应⽤程序中可能会维持⼀个全局的数据库连接，并在程序启动时初始化这个连接对象，从⽽避免在调⽤每个⽅法时都要传递⼀个Connection对象。由于JDBC的连接对象不⼀定是线程安全的，因此，当多线程应⽤程序在没有协同的情况下使⽤全局变量时，就不是线程安全的。通过将JDBC的连接保存到ThreadLocal对象中，每个线程都会拥有属于⾃⼰的连接，如程序清单3-10中的ConnectionHolder所⽰。

**程序清单3-10 使⽤ThreadLocal来维持线程封闭性**

```java
private static ThreadLocal<Connection>connectionHolder = new ThreadLocal<Connection> () { public Connection initialValue() { return DriverManager.getConnection (DB_URL) ; } }; public static Connection getConnection() { return connectionHolder.get(); 
```

当某个频繁执⾏的操作需要⼀个临时对象，例如⼀个缓冲区，⽽同时⼜希望避免在每次执⾏时都重新分配该临时对象，就可以使⽤这项技术。例如，在Java 5.0之前，Integer.toString（）⽅法使⽤ThreadLocal对象来保存⼀个12字节⼤⼩的缓冲区，⽤于对结果进⾏格式化，⽽不是使⽤共享的静态缓冲区（这需要使⽤锁机制）或者在每次调⽤时都分配⼀个新的缓冲区 [1]。

当某个线程初次调⽤ThreadLocal.get⽅法时，就会调⽤initialValue来获取初始值。从概念上看，你可以将ThreadLocal＜T＞视为包含了Map＜Thread, T＞对象，其中保存了特定于该线程的值，但ThreadLocal的实现并⾮如此。这些特定于线程的值保存在Thread对象中，当线程终⽌后，这些值会作为垃圾回收。

假设你需要将⼀个单线程应⽤程序移植到多线程环境中，通过将共享的全局变量转换为ThreadLocal对象（如果全局变量的语义允许），可以维持线程安全性。然⽽，如果将应⽤程序范围内的缓存转换为线程局部的缓存，就不会有太⼤作⽤。

在实现应⽤程序框架时⼤量使⽤了ThreadLocal。例如，在EJB调⽤期间，J2EE容器需要将⼀个事务上下⽂（Transaction Context）与某个执⾏中的线程关联起来。通过将事务上下⽂保存在静态的ThreadLocal对象中，可以很容易地实现这个功能：当框架代码需要判断当前运⾏的是哪⼀个事务时，只需从这个ThreadLocal对象中读取事务上下⽂。这种机制很⽅便，因为它避免了在调⽤每个⽅法时都要传递执⾏上下⽂信息，然⽽这也将使⽤该机制的代码与框架耦合在⼀起。

开发⼈员经常滥⽤ThreadLocal，例如将所有全局变量都作为ThreadLocal对象，或者作为⼀种“隐藏”⽅法参数的⼿段。ThreadLocal

变量类似于全局变量，它能降低代码的可重⽤性，并在类之间引⼊隐含的耦合性，因此在使⽤时要格外⼩⼼。

[1] 除⾮这个操作的执⾏频率⾮常⾼，或者分配操作的开销⾮常⾼，否则这项技术不可能带来性能提升。在Java 5.0中，这项技术被⼀种更直接的⽅式替代，即在每次调⽤时分配⼀个新的缓冲区，对于像临时缓冲区这种简单的对象，该技术并没有什么性能优势。