<template>
  <el-tree
    :data="menus"
    :props="defaultProps"
    node-key="catId"
    @node-click="nodeClick"
    ref="menuTree">
  </el-tree>
</template>

<script>
export default {
  name: 'category',
  data () {
    return {
      menus: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  methods: {
    getMenus () {
      this.$http({
        url: this.$http.adornUrl('/product/category/list/tree'),
        method: 'get'
      }).then(({data}) => {
        console.log('success!', data.data)
        this.menus = data.data
      })
    },
    nodeClick (data, node, component) {
      console.log('Sub Category Component has been clicked', data, node, component)
      this.$emit('tree-node-click', data, node, component)
    }
  },
  created () {
    this.getMenus()
  }
}
</script>

<style scoped>

</style>
