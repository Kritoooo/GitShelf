# 14.6 java.util.concurrent 同步器类中的 AQS

java.util.concurrent 中的许多可阻塞类，例如 ReentrantLock、Semaphore、ReentrantReadWriteLock、CountDownLatch、SynchronousQueue 和 FutureTask 等，都是基于 AQS 构建的。我们快速地浏览一下每个类是如何使用 AQS 的，不需要过于地深入了解细节（在 JDK 的下载包中包含了源代码）。