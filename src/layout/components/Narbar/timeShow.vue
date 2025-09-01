<template>
    <div class="india-time">
        当前印度时间：{{ indiaTime }}
    </div>
</template>

<script>
import moment from "moment-timezone";

export default {
    name: "IndiaTime",
    data() {
        return {
            indiaTime: "",
            timer: null
        };
    },
    created() {
        this.updateTime();
        document.addEventListener("visibilitychange", this.handleVisibilityChange);
    },
    beforeDestroy() {
        clearTimeout(this.timer);
        document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    },
    methods: {
        updateTime() {
            this.indiaTime = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
            this.timer = setTimeout(this.updateTime, 1000); // 递归调用
        },
        handleVisibilityChange() {
            if (!document.hidden) {
                // 页面重新可见时，立即刷新一次
                clearTimeout(this.timer);
                this.updateTime();
            }
        }
    }
};
</script>

<style scoped>
.india-time {
    font-size: 16px !important;
    font-weight: bold;
}
</style>
