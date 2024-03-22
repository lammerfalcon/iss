<script setup lang="ts">
import type { FormError } from '#ui/types'
import { UInput, URadioGroup, UTextarea } from '#components'

const emits = defineEmits(['refreshData'])
const toast = useToast()
enum PriorityColors {
  none = 'gray',
  low = 'green',
  medium = 'yellow',
  high = 'red',
}

const formConfig = [
  {
    label: 'Title',
    name: 'title',
    isRequired: true,
    component: UInput,
  },
  {
    label: 'Content',
    name: 'content',
    component: UTextarea,

  },
  {
    label: 'Priority',
    name: 'priority',
    component: URadioGroup,
    ui: { fieldset: 'flex flex-row gap-2' },
    uiRadio: { inner: 'ms-3 flex flex-col', wrapper: 'items-center' },
    options: [
      { label: 'none', value: 'none' },
      { label: 'Low', value: 'low' },
      { label: 'Medium', value: 'medium' },
      { label: 'High', value: 'high' },
    ],
  },
]

const newTask = defineModel<Task>('newTask')
const isOpen = defineModel<boolean>('isOpen')
const isEditing = defineModel<boolean>('isEditing')
const editingTask = defineModel<Task | null>('editingTask')
async function saveTask() {
  const url = `/api/tasks${isEditing.value ? `/${editingTask?.value?.id}` : ''}`
  const method = isEditing.value ? 'PUT' : 'POST'

  try {
    await $fetch(url, {
      method,
      body: newTask.value,
    })

    emits('refreshData')
    resetFormAndState()
  }
  catch (error) {
    console.error('Failed to save task:', error)
    toast.add({ title: 'Something went wrong 😢', color: 'red' })
  }
}

function resetFormAndState() {
  newTask.value = {} as Task
  editingTask.value = null
  isOpen.value = false
  isEditing.value = false
}

function validate(state: Task): FormError[] {
  const errors = []
  if (!state?.title)
    errors.push({ path: 'title', message: 'Required' })
  return errors
}
watchEffect(() => {
  if (isOpen.value && !isEditing.value)
    newTask.value = {} as Task
})
</script>

<template>
  <UCard>
    <template #header>
      Create new task
    </template>
    <template #default>
      <UForm :validate="validate" :state="newTask" class="flex flex-col gap-4" @submit="saveTask">
        <UFormGroup v-for="field in formConfig" :key="field.name" :name="field.name" :required="field.isRequired" :label="field.label">
          <component v-bind="field" :is="field.component" v-model="newTask[field?.name]">
            <template #label="{ option }">
              <UBadge :color="PriorityColors[option.value as keyof typeof PriorityColors]" variant="subtle">
                {{ option.label }}
              </UBadge>
            </template>
          </component>
        </UFormGroup>
        <div class="flex flex-row gap-2 justify-end mt-4">
          <UButton type="submit" variant="outline">
            {{ isEditing ? 'Update' : 'Create' }}
          </UButton>

          <UButton variant="outline" @click="isOpen = false">
            Cancel
          </UButton>
        </div>
      </UForm>
    </template>
  </UCard>
</template>

<style scoped>

</style>
