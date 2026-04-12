# 15.3.1 原子变量是一种“更好的volatile”

在3.4.2节中，我们使用了一个指向不可变对象的volatile引用来原子地更新多个状态变量。这个示例依赖于“先检查再运行”，但这种特殊的情况下，竞争是无害的，因为我们并不关心是否会偶尔地丢失更新操作。而在大多数情况下，这种“先检查再运行”不会是无害的，并且可能破坏数据的一致性。例如，第4章中的NumberRange既不能使用指向不可变对象的volatile引用来安全地实现上界和下界，也不能使用原子的整数来保存这两个边界。由于有一个不变性条件限制了两个数值，并且它们无法在同时更新时还维持该不变性条件，因此如果在数值范围类中使用volatile引用或者多个原子整数，那么将出现不安全的“先检查再运行”操作序列。

可以将OneValueCache中的技术与原子引用结合起来，并且通过对指向不可变对象（其中保存了下界和上界）的引用进行原子更新以避免竞态条件。在程序清单15-3的CasNumber-

Range 中使用了 AtomicReference 和 IntPair 来保存状态，并通过使用 compare-AndSet，使它在更新上界或下界时能避免 NumberRange 的竞态条件。

程序清单15-3 通过CAS来维持包含多个变量的不变性条件  
```java
public class CasNumberRange {
    @Immutable
    private static class IntPair {
        final int lower; // 不变性条件：lower <= upper
        final int upper;
        ...
    }
    private final AtomicReference<intPair> values = new AtomicReference<intPair>(new IntPair(0, 0));
    public int getLower() { return values.get().lower; }
    public int getUpper() { return values.get().upper; }
    public void setLower(int i) {
        while (true) {
            IntPair oldv = values.get();
            if (i > oldv-upper) throw new IllegalArgumentException("Can't set lower to " + i + " > upper");
            IntPair newv = new IntPair(i, oldv_upper);
            if (values comparAndSet(oldv, newv)) return;
        }
    }
} 
```