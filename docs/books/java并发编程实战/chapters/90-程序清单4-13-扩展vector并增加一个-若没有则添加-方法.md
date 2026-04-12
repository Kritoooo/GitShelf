# 程序清单4-13 扩展Vector并增加一个“若没有则添加”方法

@ThreadSafe   
public class BetterVectorE> extends VectorE> { public synchronized boolean putIfAbsent(E x) { boolean absent $=$ !contains(x); if(absent) add(x); return absent; }   
}

“扩展”方法比直接将代码添加到类中更加脆弱，因为现在的同步策略实现被分布到多个单独维护的源代码文件中。如果底层的类改变了同步策略并选择了不同的锁来保护它的状态变量，那么子类会被破坏，因为在同步策略改变后它无法再使用正确的锁来控制对基类状态的并发访问。（在 Vector 的规范中定义了它的同步策略，因此 BetterVector 不存在这个问题。）