# 程序清单11-7 将ServerStatus重新改写为使用锁分解技术

```java
@ThreadSafe   
public class ServerStatus { @GuardedBy("users") public final Set<String> users; @GuardedBy("queries") public final Set<String> queries; 
```

```java
public void addUser(String u) { synchronized (users) { users.add(u); }   
public void addQuery(String q) { synchronized (queries) { queries.add(q); }   
// 去掉同样被改写为使用被分解锁的方法 
```

如果在锁上存在适中而不是激烈的竞争时，通过将一个锁分解为两个锁，能最大限度地提升性能。如果对竞争并不激烈的锁进行分解，那么在性能和吞吐量等方面带来的提升将非常有限，但是也会提高性能随着竞争提高而下降的拐点值。对竞争适中的锁进行分解时，实际上是把这些锁转变为非竞争的锁，从而有效地提高性能和可伸缩性。