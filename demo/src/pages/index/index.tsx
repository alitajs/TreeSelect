import React from "react";
// package.json 中哪些依赖都不用装，因为这里使用 alias 关联
// @ts-ignore
import TreeSelect from "treeselect4m";
export default function ({}) {
  return (
    <TreeSelect
      onChange={(data: any) => console.log("data", data)}
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
