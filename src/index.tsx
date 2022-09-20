import React, { useState, FC, useEffect, useMemo } from "react";
import {
  Input,
  List,
  SearchBar,
  Checkbox,
  NavBar,
  Space,
  Button,
} from "antd-mobile";
import { RightOutline } from "antd-mobile-icons";
import { Page, Content, Header, Show, Footer } from "@alita/flow";

interface TreeDataItem {
  value: string;
  title?: string;
  id?: string;
  children?: TreeDataItem[];
  childrenValue?: string[];
  parent?: {
    value: string;
    parent?: any;
  };
  [key: string]: any;
}
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
const TreeSelect: FC<TreeSelectProps> = ({
  treeData: treeDataSource = [],
  placeholder = "请选择",
  label = "树选择器",
  showSearch = true,
  multiple: multipleAble = false,
  treeCheckable = false,
  treeNodeFilterProp = "title",
  onChange,
  value,
}) => {
  const bindChildrenParent = (datasource: TreeDataItem[]) => {
    const loop = (data: TreeDataItem[]) => {
      data.forEach((item) => {
        if (item.children) {
          item.childrenValue = [];
          item.children.forEach((child: TreeDataItem) => {
            child.parent = {
              value: item?.value,
              parent: item?.parent,
            };
            item?.childrenValue?.push(child?.value);
          });
          loop(item.children);
        }
      });
    };
    loop(datasource);
    return datasource;
  };
  const treeData = useMemo(() => {
    return bindChildrenParent(treeDataSource);
  }, [treeDataSource]);
  const [visible, setVisible] = useState(false);
  // 支持多选（当设置 treeCheckable 时自动变为 true）
  const [multiple] = useState(multipleAble || treeCheckable);
  const [breadcrumb, setBreadcrumb] = useState<any>([]);
  const [list, setList] = useState(treeData);
  const [thisValue, setThisValue] = useState<string | string[]>();
  const [checkableValue, setCheckableValue] = useState<string[]>([]);
  const [showValue, setShowValue] = useState<string>("");
  const [searchText, setSearchText] = useState("");

  // 根据 value 找到对象
  const getItemByValue = (
    listSource: TreeDataItem[],
    value: any
  ): TreeDataItem => {
    let item: any = null;
    listSource.forEach((i) => {
      if (i?.value === value) {
        item = i;
      } else if (i?.children) {
        item = getItemByValue(i?.children, value);
      }
    });
    return item as TreeDataItem;
  };
  // 找到所有的子级和孙级
  const getChilrenValue = (listSource: TreeDataItem[]) => {
    let arr: string[] = [];
    if (!listSource) return arr;
    listSource.forEach((item) => {
      arr.push(item?.value);
      if (item?.children) {
        arr = arr.concat(getChilrenValue(item?.children));
      }
    });
    return arr;
  };

  useEffect(() => {
    // 和外部 value 绑定
    setThisValue(value);
    if (treeCheckable) {
      let arr: any = value;
      (value as string[]).forEach((v: string) => {
        const item = getItemByValue(treeData, v);
        if (item?.children) {
          arr = arr.concat(getChilrenValue(item?.children));
        }
      });
      setCheckableValue(arr);
    }
  }, [JSON.stringify(value), treeData]);
  const getSearchedList = (datasource: TreeDataItem[], searchText: string) => {
    const result: TreeDataItem[] = [];
    const loop = (data: TreeDataItem[], description: string[]) => {
      data.forEach((item) => {
        if (item[treeNodeFilterProp].indexOf(searchText) > -1) {
          item.description = description.join(" - ");
          result.push(item);
        }
        if (item.children) {
          loop(item.children, [...description, item?.title || ""]);
        }
      });
    };
    loop(datasource, []);
    return result;
  };

  useEffect(() => {
    if (!searchText) {
      setList(treeData);
    } else {
      setList(getSearchedList(treeData, searchText));
    }
    setBreadcrumb([]);
  }, [searchText]);
  useEffect(() => {
    let show = thisValue as string;
    if (multiple && typeof thisValue === "object") {
      show = thisValue?.join(",");
    }
    // 和外部 value 绑定
    setShowValue(show);
  }, [JSON.stringify(thisValue)]);

  const getCheckboxValue = (item: TreeDataItem) => {
    // 允许复选
    if (treeCheckable) {
      if (item?.parent && getCheckboxValue(item?.parent)) return true;
      return checkableValue?.includes(item?.value);
    } else if (multiple) {
      return thisValue?.includes(item?.value);
    } else {
      return item?.value === thisValue;
    }
  };
  const getIndeterminate = (item: any) => {
    let indeta = 0;
    if (!treeCheckable) {
      return indeta;
    }
    item?.childrenValue?.forEach((child: any) => {
      if (checkableValue?.includes(child)) {
        indeta += 1;
      }
    });
    return indeta && item?.childrenValue && indeta < item?.childrenValue.length;
  };
  // 统计所有子集被选中情况
  const countChecked = (list: any) => {
    let count = 0;
    list.forEach((item: any) => {
      if (getCheckboxValue(item)) {
        count += 1;
      }
      if (item?.children) {
        count += countChecked(item?.children);
      }
    });
    return count;
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
        onClick={() => {
          if (treeData && treeData.length > 0) {
            setVisible(true);
          } else {
            setShowValue("未正确配置数据来源，无法使用");
          }
        }}
      >
        <Input
          style={{ flex: "auto" }}
          placeholder={placeholder}
          disabled
          value={showValue}
        />
        <div
          style={{
            flex: "none",
            marginLeft: "0.08rem",
            padding: "0.04rem",
            cursor: "pointer",
          }}
        >
          <RightOutline />
        </div>
      </div>
      <Show when={visible}>
        <Page
          style={{
            backgroundColor: "white",
          }}
        >
          <Header>
            <NavBar
              onBack={() => setVisible(false)}
              //   style={{
              //     "--border-bottom": "solid 1px var(--adm-color-border)",
              //   }}
            >
              {label}
            </NavBar>
            <Show when={showSearch}>
              <div
                style={{
                  padding: "0 0.32rem 0.32rem 0.32rem",
                }}
              >
                <SearchBar
                  placeholder="输入文字过滤选项"
                  value={searchText}
                  onChange={(v) => {
                    setSearchText(v);
                  }}
                  showCancelButton={() => !!searchText}
                />
              </div>
            </Show>
            <Show when={breadcrumb.length > 0}>
              <Space
                style={{
                  padding: "0 0.32rem 0.32rem 0.32rem",
                  fontSize: "0.32rem",
                }}
              >
                <span
                  onClick={() => {
                    setList(treeData);
                    setBreadcrumb([]);
                  }}
                >
                  <a>全部</a>
                  <RightOutline />
                </span>
                {breadcrumb.map((_: any, index: number) => {
                  // TODO: 找到真实的 item，因为 breadcrumb 只保存了角标，可以优化
                  let bread: TreeDataItem = treeData[breadcrumb[0]];
                  for (let i = 1; i <= index; i++) {
                    bread = bread?.children?.[breadcrumb[index]]!;
                  }
                  return (
                    <span key={bread?.id}>
                      <Show
                        when={index !== breadcrumb.length - 1}
                        fallback={<span>{bread?.title}</span>}
                      >
                        <a
                          onClick={() => {
                            // TODO: 找到真实的 列表，因为 breadcrumb 只保存了角标，需要找到它的上级，可以优化
                            let bread: any = treeData[breadcrumb[0]];
                            // 注意此处的条件与上面的不同
                            for (let i = 1; i < index; i++) {
                              bread = bread?.children[breadcrumb[index]];
                            }
                            setList(bread?.children);
                            setBreadcrumb(breadcrumb.slice(0, index + 1));
                          }}
                        >
                          {bread?.title}
                        </a>
                      </Show>
                      <RightOutline />
                    </span>
                  );
                })}
              </Space>
            </Show>
            <div
              style={{
                backgroundColor: "#F6F5F8",
                height: "0.2rem",
              }}
            ></div>
          </Header>
          <Content
            style={{
              backgroundColor: "#F6F5F8",
            }}
          >
            <List>
              {list.map((item, index: number) => (
                <List.Item
                  prefix={
                    // 捕获 prefix 的点击事件，这么写好怪
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={getCheckboxValue(item)}
                        indeterminate={getIndeterminate(item)}
                        onChange={(check) => {
                          // 选中
                          if (check) {
                            if (treeCheckable) {
                              const getParentValue = (values: string[]) => {
                                let target: any = [];
                                let doChange = true;
                                do {
                                  const newValues = values.concat(target);
                                  let hasChange = false;
                                  newValues.forEach((value: string) => {
                                    const item = getItemByValue(
                                      treeData,
                                      value
                                    );
                                    if (item?.parent) {
                                      const parent = getItemByValue(
                                        treeData,
                                        item?.parent?.value
                                      );
                                      if (
                                        target.includes(parent?.value) ||
                                        newValues.includes(parent?.value)
                                      ) {
                                        return;
                                      }
                                      let allTrue = true;
                                      parent?.childrenValue?.forEach(
                                        (i: string) => {
                                          if (!newValues.includes(i)) {
                                            allTrue = false;
                                          }
                                        }
                                      );
                                      if (allTrue) {
                                        newValues.push(parent?.value);
                                        target.push(parent?.value);
                                        hasChange = true;
                                      }
                                    }
                                  });
                                  if (!hasChange) doChange = false;
                                } while (doChange);
                                return values.concat(target);
                              };
                              setCheckableValue(
                                getParentValue(
                                  [
                                    ...((checkableValue as string[]) || []),
                                    item?.value,
                                  ].concat(getChilrenValue(item?.children!))
                                )
                              );
                            } else if (multiple) {
                              if (thisValue?.includes(item?.value)) {
                                return;
                              }
                              setThisValue([
                                ...((thisValue as string[]) || []),
                                item?.value,
                              ]);
                            } else {
                              setThisValue(item?.value);
                            }
                          } else {
                            // 取消选中
                            if (treeCheckable) {
                              const getParentValue = (
                                itemTarget: TreeDataItem
                              ) => {
                                let arr: string[] = [];
                                arr.push(itemTarget?.value);
                                if (itemTarget?.parent) {
                                  arr = arr.concat(
                                    getParentValue(itemTarget?.parent)
                                  );
                                }
                                return arr;
                              };
                              const parentValue = getParentValue(item);
                              setCheckableValue(
                                ((checkableValue as string[]) || []).filter(
                                  (v) => !parentValue?.includes(v)
                                )
                              );
                            } else if (multiple) {
                              setThisValue(
                                ((thisValue as string[]) || []).filter(
                                  (v) => v !== item?.value
                                )
                              );
                            } else {
                              setThisValue(undefined);
                            }
                          }
                        }}
                      />
                    </div>
                  }
                  key={item?.id}
                  onClick={
                    item?.children
                      ? () => {
                          if (item?.children!.length > 0) {
                            setBreadcrumb([...breadcrumb, index]);
                            setList(item?.children!);
                          }
                        }
                      : undefined
                  }
                  extra={
                    item?.children && multiple
                      ? `已选 ${countChecked(item?.children)}`
                      : undefined
                  }
                  description={searchText ? item?.description || "" : ""}
                >
                  {item?.title}
                </List.Item>
              ))}
            </List>
          </Content>
          <Footer>
            <div
              style={{
                padding: "0.32rem",
              }}
            >
              <a>
                已选
                {multiple ? thisValue?.length || "0" : thisValue ? "1" : "0"}项
              </a>
              <Button
                block
                color="primary"
                size="large"
                style={{
                  marginTop: "0.32rem",
                }}
                onClick={() => {
                  if (treeCheckable) {
                    let arr: string[] = checkableValue;
                    // 父级选中，删除所有子级和孙子选中
                    checkableValue.forEach((v: string) => {
                      const item = getItemByValue(treeData, v);
                      if (item?.children) {
                        const childrenValue = getChilrenValue(item?.children);
                        arr = arr.filter(
                          (i: string) => !childrenValue?.includes(i)
                        );
                      }
                    });
                    onChange?.(arr);
                  } else {
                    onChange?.(thisValue);
                  }
                  setVisible(false);
                }}
              >
                确定
              </Button>
            </div>
          </Footer>
        </Page>
      </Show>
    </>
  );
};

export default TreeSelect;
