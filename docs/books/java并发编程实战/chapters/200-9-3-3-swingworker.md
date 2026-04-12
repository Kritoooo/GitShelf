# 9.3.3 SwingWorker

我们已经通过FutureTask和Executor构建了一个简单的框架，它会在后台线程中执行长时间的任务，因此不会影响GUI的响应性。在任何单线程的GUI框架都可以使用这些技术，而不仅限于Swing。在Swing中，这里给出的许多特性是由SwingWorker类提供的，包括取消、完成通知、进度指示等。在《The Swing Connection》和《The Java Tutorial》等资料中介绍了不同版本的SwingWorker，并在Java 6中包含了一个更新后的版本。