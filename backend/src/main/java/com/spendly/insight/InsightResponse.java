package com.spendly.insight;

public class InsightResponse {

    private String id;
    private String type; // SUCCESS, WARNING, INFO, TIP
    private String title;
    private String message;
    private String reason;
    private String category;

    public InsightResponse() {
    }

    public InsightResponse(String id, String type, String title, String message, String reason, String category) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.message = message;
        this.reason = reason;
        this.category = category;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
