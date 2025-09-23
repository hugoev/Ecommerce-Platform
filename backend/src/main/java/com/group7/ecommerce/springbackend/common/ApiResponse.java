package com.group7.ecommerce.springbackend.common;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;

public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;
    private PaginationMetadata pagination;

    // Constructors
    public ApiResponse(T data) {
        this.success = true;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }

    public ApiResponse(T data, String message) {
        this.success = true;
        this.data = data;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    public ApiResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    public ApiResponse(T data, PaginationMetadata pagination) {
        this.success = true;
        this.data = data;
        this.pagination = pagination;
        this.timestamp = LocalDateTime.now();
    }

    // Static factory methods
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(data);
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(data, message);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message);
    }

    public static <T> ApiResponse<List<T>> paged(List<T> data, Page<T> page) {
        PaginationMetadata pagination = new PaginationMetadata(
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast(),
                page.hasNext(),
                page.hasPrevious());
        return new ApiResponse<>(data, pagination);
    }

    // Getters and setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public PaginationMetadata getPagination() {
        return pagination;
    }

    public void setPagination(PaginationMetadata pagination) {
        this.pagination = pagination;
    }

    public static class PaginationMetadata {
        private int pageNumber;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean first;
        private boolean last;
        private boolean hasNext;
        private boolean hasPrevious;

        public PaginationMetadata(int pageNumber, int pageSize, long totalElements, int totalPages,
                boolean first, boolean last, boolean hasNext, boolean hasPrevious) {
            this.pageNumber = pageNumber;
            this.pageSize = pageSize;
            this.totalElements = totalElements;
            this.totalPages = totalPages;
            this.first = first;
            this.last = last;
            this.hasNext = hasNext;
            this.hasPrevious = hasPrevious;
        }

        // Getters
        public int getPageNumber() {
            return pageNumber;
        }

        public int getPageSize() {
            return pageSize;
        }

        public long getTotalElements() {
            return totalElements;
        }

        public int getTotalPages() {
            return totalPages;
        }

        public boolean isFirst() {
            return first;
        }

        public boolean isLast() {
            return last;
        }

        public boolean isHasNext() {
            return hasNext;
        }

        public boolean isHasPrevious() {
            return hasPrevious;
        }
    }
}

