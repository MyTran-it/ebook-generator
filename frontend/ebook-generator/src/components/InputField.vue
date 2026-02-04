<script setup>
import { defineProps, defineModel } from 'vue'

const { label, name, type } = defineProps({
    label: { type: String, default: '' },
    name: { type: String, default: '' },
    type: { type: String, default: 'text' }
})


const model = defineModel()
</script>

<template>
    <div class="input-field">
        <label :for="name">
            {{ label }}
        </label>
        <input :type="type" :name="name" v-model="model" />
    </div>
</template>