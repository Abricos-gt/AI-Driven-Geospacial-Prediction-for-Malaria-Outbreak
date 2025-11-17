<template>
  <div
    v-if="visible"
    class="offline-notice"
    role="status"
  >
    <strong>Demo mode:</strong>
    Backend not connected, showing live mock data for exploration.
  </div>
</template>

<script>
export default {
  name: 'OfflineNotice',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.offline-notice {
  background: #fff4e5;
  color: #9c6c1a;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #f6c68a;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
</style>
