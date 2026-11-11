# dsh-ponytail

给 DeepSeek Harness（DSH）装上“懒人高级工程师”的工作方式：能用最少的代码完整解决问题，就不多写一行。

装上后，每次对话都会注入一套极简编码规则，并提供 5 个一次性技能，配合 `/ponytail` 在 lite / full / ultra / off 之间切换。

## 安装

从插件市场搜索 dsh-ponytail 一键安装，或用命令行：

```sh
dsh plugin --profile <profile> add github:yanweiyi11/dsh-ponytail
```

装完重启 DSH。

## 使用

```text
/ponytail                查看当前级别
/ponytail lite           只做要求的事，顺带一行说明更小的方案
/ponytail full           默认：最小完整改动，需要时留一个检查
/ponytail ultra          先质疑需求，再做
/ponytail off            关闭
```

说 `stop ponytail` 或 `normal mode` 也会关闭；再说 `/ponytail` 恢复。

技能：

- `/ponytail-review`：审查一次改动，按 缺陷 / 风险 / 负载 / 缺测试 / 性能 / 冗余 给出可执行的修改建议。
- `/ponytail-audit`：对整仓做同样维度的审查，按严重程度排序。
- `/ponytail-debt`：把所有 `shortcut:` 注释汇总成一张技术债清单，标出上限和升级时机。
- `/ponytail-gain`：展示该方法公开的基准收益卡。
- `/ponytail-help`：命令速查。

## 默认级别

新会话默认跟随 `PONYTAIL_DEFAULT_MODE` 环境变量（lite / full / ultra / off）；没有设置时为 full。也可以在 profile 的插件配置里用 `defaultMode` 指定。会话内的 `/ponytail` 切换只影响当前会话。

## 兼容与隐私

- 纯 JavaScript，无构建步骤，安装后即可用。
- 不联网，不读取凭据，不写入用户文件；运行时只读自身随包的技能文件。
- 规则以系统提示段落的形式注入，不改动宿主代码。

## 来源与致谢

本插件的规则与技能文本源自 [Ponytail](https://github.com/DietrichGebert/ponytail) 项目，按其 MIT 许可使用。许可证副本见 [LICENSES/ponytail-MIT.txt](LICENSES/ponytail-MIT.txt)。

## 许可

MIT。第三方文本的许可见 [NOTICE](NOTICE) 与 [LICENSES/ponytail-MIT.txt](LICENSES/ponytail-MIT.txt)。
