CREATE TABLE sales_items (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    sale_price DECIMAL(10, 2) NOT NULL,
    sale_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    sale_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sales_items_item_id ON sales_items(item_id);
CREATE INDEX idx_sales_items_is_active ON sales_items(is_active);
CREATE INDEX idx_sales_items_dates ON sales_items(sale_start_date, sale_end_date);

