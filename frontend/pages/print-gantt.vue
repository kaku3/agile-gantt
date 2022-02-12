<template>
  <v-row>
    <v-col cols="12">
      <PrintGanttComponent :targetTaskIds="targetTaskIds"></PrintGanttComponent>
    </v-col>
  </v-row>
</template>
<script>
export default {
  layout: 'printGantt',
  async asyncData(context) {
    const targetTaskIds = context.query.targetTaskIds || []
    return {
      targetTaskIds
    }
  }
}
</script>
