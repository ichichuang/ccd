<script setup lang="ts">
import Message from 'primevue/message'
</script>
<template>
  <div class="between-col justify-start gap-gapl">
    <div class="center gap-gap">
      <Message severity="success">Success Message </Message>
      <Message severity="info">Info Message </Message>
      <Message severity="warn">Warn Message </Message>
      <Message severity="error">Error Message </Message>
      <Message severity="secondary">Secondary Message </Message>
      <Message severity="contrast">Contrast Message </Message>
    </div>
    <div class="center gap-gap">
      <Message severity="info">Info Message </Message>
      <Message severity="success">
        <template #icon>
          <Avatar
            image="./face.png"
            shape="circle"
          />
        </template>
        <span class="ml-2">How may I help you?</span>
      </Message>
    </div>
    <div class="center gap-gap">
      <Message
        severity="success"
        variant="outlined"
        >Success Message
      </Message>
      <Message
        severity="info"
        variant="outlined"
        >Info Message
      </Message>
      <Message
        severity="warn"
        variant="outlined"
        >Warn Message
      </Message>
      <Message
        severity="error"
        variant="outlined"
        >Error Message
      </Message>
      <Message
        severity="secondary"
        variant="outlined"
        >Secondary Message
      </Message>
      <Message
        severity="contrast"
        variant="outlined"
        >Contrast Message
      </Message>
    </div>
    <div class="center gap-gap">
      <Message
        severity="success"
        variant="simple"
        >Success Message
      </Message>
      <Message
        severity="info"
        variant="simple"
        >Info Message
      </Message>
      <Message
        severity="warn"
        variant="simple"
        >Warn Message
      </Message>
      <Message
        severity="error"
        variant="simple"
        >Error Message
      </Message>
      <Message
        severity="secondary"
        variant="simple"
        >Secondary Message
      </Message>
      <Message
        severity="contrast"
        variant="simple"
        >Contrast Message
      </Message>
    </div>
    <div class="center gap-gap">
      <Message size="small">
        <div class="center gap-gaps">
          <Icons
            name="fc-info"
            size="s"
          ></Icons>
          Small Message
        </div>
      </Message>
      <Message>
        <div class="center gap-gaps">
          <Icons
            name="fc-info"
            size="m"
          ></Icons>
          Normal Message
        </div>
      </Message>
      <Message size="large">
        <div class="center gap-gaps">
          <Icons
            name="fc-info"
            size="l"
          ></Icons>
          Large Message
        </div>
      </Message>
    </div>
    <div class="center gap-gap">
      <Message closable>Closable Message </Message>
    </div>
  </div>
</template>
<style lang="scss" scope></style>
