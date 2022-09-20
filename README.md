# TreeSelect

移动端的树选择器，效果图如下：

![image](https://user-images.githubusercontent.com/11746742/191158151-bc22c943-337a-449c-bf41-18cf768705fd.png)

因为数据量不大，最开始做的时候没对数据源做解构，所以从头到尾就是对数组的循环查询，因为支持无限层级，所以时间复杂度，会无限上升。其实在最开始将属性拆成平级，通过 parentId 和 childrenId 去找就会快很多，但我懒得改。感兴趣的朋友可以 PR，或者等我下次改版再说。

## 使用

```bash
pnpm i treeselect4m
```

```tsx
import TreeSelect from "treeselect4m";
import React from "react";

export default function ({}) {
  return (
    <TreeSelect
      onChange={(data) => console.log("data", data)}
      value={["显示值1"]}
      treeData={[
        {
          title: "显示值1",
          value: "显示值1",
          children: [
            {
              title: "显示值2",
              value: "显示值2",
              id: "125191",
              children: [
                {
                  title: "显示值3",
                  value: "显示值3",
                  id: "744995",
                },
              ],
            },
          ],
        },
      ]}
      multiple
      treeCheckable
    />
  );
}
```


## 属性

```TSX
interface TreeSelectProps {
  // 引导文字
  placeholder?: string;
  // 标题
  label?: string;
  // 是否可搜索
  showSearch?: boolean;
  // 支持多选（当设置 treeCheckable 时自动变为 true）
  multiple?: boolean;
  // 是否复选
  treeCheckable?: boolean;
  // 选择数据源 datasource
  treeData?: TreeDataItem[];
  // 过滤条件
  treeNodeFilterProp?: string;
  // 展开所有，应该是 pc 端特有的
  treeDefaultExpandAll?: boolean;
  onChange?: (value: string | string[] | undefined) => void;
  // multiple 为 false 时 value 为 string，multiple 为 true 时 value 为 string[]
  value?: string | string[];
}
```

## 注意

1、multiple 为 false 时 value 为 string，multiple 为 true 时 value 为 string[]
2、当设置 treeCheckable 时 multiple 自动变为 true
3、当 treeCheckable 为 false 时，父子间选择无关联，各选各的