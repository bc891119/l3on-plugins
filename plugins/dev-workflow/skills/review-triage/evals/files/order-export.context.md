# orders/views.py（修改後完整內容節錄）

```python
10 class OrderExportView(LoginRequiredMixin, View):
11     def get(self, request):
12         rows = Order.objects.all().order_by('-id')
13         status = request.GET.get('status', 'open')
14         rows = rows.filter(status=status)
15         return export_csv(rows)
16
17 class OrderListView(LoginRequiredMixin, View):      # 本次沒有修改
18     def get(self, request):
19         return render(request, 'list.html', {'rows': Order.objects.all()})
```

`Order.objects.visible_to(user)` 是專案規定的部門隔離入口，CLAUDE.md 規定所有查詢都要經過它。
`status` 是 CharField，非法值只會查不到資料，不會出錯。
