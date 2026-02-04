<script setup>
import { defineProps, defineModel } from 'vue'

const { label, name, type } = defineProps({
    label: { type: String, default: '' },
    name: { type: String, default: '' },
    type: { type: String, default: 'text' },
    placeholder: { type: String, defdaul: '' }
})


const model = defineModel()
</script>

<template>
    <div class="input-field">
        <label :for="name">
            {{ label }}
        </label>
        <textarea :type="type" :name="name" v-model="model">
            {{ placeholder }}
        </textarea>
    </div>
</template>

<style lang="scss" scoped>
textarea {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    resize: vertical;
}
</style>