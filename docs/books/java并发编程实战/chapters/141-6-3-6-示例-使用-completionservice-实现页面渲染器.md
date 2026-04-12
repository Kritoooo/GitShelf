# 6.3.6 示例：使用 CompletionService 实现页面渲染器

可以通过CompletionService从两个方面来提高页面渲染器的性能：缩短总运行时间以及提高响应性。为每一幅图像的下载都创建一个独立任务，并在线程池中执行它们，从而将串行的下载过程转换为并行的过程：这将减少下载所有图像的总时间。此外，通过从CompletionService中获取结果以及使每张图片在下载完成后立刻显示出来，能使用户获得一个更加动态和更高响应性的用户界面。如程序清单6-15的Renderer所示。

程序清单6-15 使用CompletionService，使页面元素在下载完成后立即显示出来  
```java
public class Renderer { private final ExecutorService executor; Rendering ExecutorService executor) { thisexecutor = executor; } void renderPage( CharSequence source) { List<ImageInfo> info = scanForImageInfo.source); CompletionService<图像Data> completionService = new ExecutorCompletionService<图像Data>(executor); for (final ImageInfo imageInfo : info) completionService.submit(new Callable<图像Data>() { public ImageData call() { return imageInfo.downloadImage(); } } ); renderTextsource); try { for (int t = 0, n = info.size(); t < n; t++) { Future<图像Data> f = completionService.take(); Images data imageData = f.get(); renderImage(imageData); } } catch (InterruptedException e) { Thread.currentThread().interrupt(); } catch (ExecutionException e) { throw LAnderThrowable(e.getCause()); } } } 
```

多个 ExecutorCompletionService 可以共享一个 Executor，因此可以创建一个对于特定计算私有，又能共享一个公共 Executor 的 ExecutorCompletionService。因此，CompletionService 的作用就相当于一组计算的句柄，这与 Future 作为单个计算的句柄是非常类似的。通过记录提交给 CompletionService 的任务数量，并计算出已经获得的已完成结果的数量，即使使用一个共享的 Executor，也能知道已经获得了所有任务结果的时间。