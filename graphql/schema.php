<?php

namespace App\GraphQL;

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

use GraphQL\Type\Definition\Type;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Schema;
use GraphQL\GraphQL;
use GraphQL\Error\Debug;
use App\Classes\Models\Order;
use App\Classes\Models\Product;
use App\Classes\Models\Category;
use App\Classes\Models\ProductNameDescription;
use App\Classes\Models\ProductGallery;
use App\Classes\Models\AttributeItem;
use App\Classes\Models\SwatchAttribute;
use App\Classes\Models\TextAttribute;

$attributeItemType = new ObjectType([
    'name' => 'AttributeItem',
    'fields' => [
        'display_value' => Type::nonNull(Type::string()),
        'value' => Type::nonNull(Type::string()),
        'id' => Type::nonNull(Type::string()),
    ],
]);

$attributeType = new ObjectType([
    'name' => 'Attribute',
    'fields' => [
        'id' => Type::nonNull(Type::string()),
        'attribute_id' => Type::nonNull(Type::string()),
        'name' => Type::nonNull(Type::string()),
        'type' => Type::nonNull(Type::string()),
        'items' => Type::listOf($attributeItemType),
    ],
]);

$productType = new ObjectType([
    'name' => 'Product',
    'fields' => [
        'id' => Type::nonNull(Type::string()),
        'name' => Type::nonNull(Type::string()),
        'instock' => Type::nonNull(Type::boolean()),
        'gallery' => Type::listOf(Type::nonNull(Type::string())),
        'description' => Type::nonNull(Type::string()),
        'category' => Type::string(),
        'attributes' => Type::listOf($attributeType),
        'price_amount' => Type::nonNull(Type::float()),
        'price_currency_label' => Type::nonNull(Type::string()),
        'price_currency_symbol' => Type::nonNull(Type::string()),
        'brand' => Type::nonNull(Type::string()),
    ],
]);

$categoryType = new ObjectType([
    'name' => 'Category',
    'fields' => [
        'id' => Type::nonNull(Type::int()),
        'name' => Type::nonNull(Type::string()),
    ],
]);


$queryType = new ObjectType([
    'name' => 'Query',
    'fields' => [
        'categories' => [
            'type' => Type::listOf($categoryType),
            'args' => [
                'id' => Type::int(),
            ],
            'resolve' => function($root, $args) {
                $categoryModel = new Category();
                $categoryId = $args['id'] ?? null;
                if ($categoryId !== null) {
                    return [$categoryModel->getCategoryNameByCategoryIdAndLanguageId($categoryId, "english")];
                } else {
                    return $categoryModel->getAllCategoryNamesByLanguageId("english");
                }
            },
        ],
        'attribute' => [
            'type' => $attributeType,
            'args' => [
                'attribute_id' => Type::nonNull(Type::string()),
            ],
            'resolve' => function($root, $args) {
                
                $attributeModel = new TextAttribute();
                
                $attribute = $attributeModel->getById($args['attribute_id']);
                if ($attribute === null) {
                    error_log('attribute resolve - null');
                    $attributeModel = new SwatchAttribute();
                    $attribute = $attributeModel->getById($args['attribute_id']);
                }
                if ($attribute === null) {
                    return null;
                }
                $attributeItemModel = new AttributeItem();
                $items = $attributeItemModel->getItemsByAttributeId($args['attribute_id']);
                
                if ($items === null) {
                    $items = [];
                }
                
                $attribute['items'] = $items;                

                if (!is_array($attribute) || !isset($attribute['items'])) {
                    error_log('attribute resolve - invalid format');
                    return null;
                }

                return $attribute;
            },
        ],
        'getItemsByAttributeIdAndProductId' => [
            'type' => Type::listOf($attributeItemType),
            'args' => [
                'product_id' => Type::nonNull(Type::string()),
                'attribute_id' => Type::nonNull(Type::string()),
            ],
            'resolve' => function ($root, $args) {
                $attributeItemModel = new AttributeItem();
                return $attributeItemModel->getItemsByAttributeIdAndProductId($args['attribute_id'], $args['product_id']);
            },
        ],
        'products' => [
            'type' => Type::listOf($productType),
            'args' => [
                'categoryId' => Type::int(),
            ],
            'resolve' => function($root, $args) {

                error_log('products resolve started');
              
                $productModel = new Product();
                error_log('products resolve 2');
                $categoryId = $args['categoryId'] ?? null;
                
                if ($categoryId !== null) {
                    if ($categoryId == 0) {
                        $products = $productModel->getAll();
                    } else {
                        $products = $productModel->fetchProductsByCategory($categoryId);
                    }
                } else {
                    $products = $productModel->getAll();
                }

                $productNameDescriptionModel = new ProductNameDescription();
                $productGalleryModel = new ProductGallery();
                $attributeItemModel = new AttributeItem();
                $categoryModel = new Category();

                foreach ($products as &$product) {
                    $productNameDescription = $productNameDescriptionModel->getByProductIdAndLanguageId($product['id'], 'english');
                    if ($productNameDescription) {
                        $product['name'] = $productNameDescription['name'];
                        $product['description'] = $productNameDescription['description'];
                    }
                    $product['gallery'] = array_map(function($gallery) {
                        return $gallery['link'];
                    }, $productGalleryModel->getByProductId($product['id']));
                    $category = $categoryModel->getCategoryNameByProductIdAndLanguageId($product['id'], 'english');
                    $product['category'] = $category['name'] ?? null;
                }

                return $products;
            },
        ],
        'product' => [
            'type' => $productType,
            'args' => [
                'id' => Type::nonNull(Type::string()),
            ],
            'resolve' => function($root, $args) {  
                error_log('product resolve 1');              

                try {
                    error_log('Attempting to create Product model');
                    $productModel = new Product();
                    error_log('Product model created successfully');
                } catch (Exception $e) {
                    error_log("Error creating Product model: " . $e->getMessage());
                    throw $e;
                }
            
                error_log('product resolve 2'); 
                $result = $productModel->getProductById($args['id']);                
                return $result;
            },
        ],
    ],
]);

$mutationType = new ObjectType([
    'name' => 'Mutation',
    'fields' => [
        'createOrder' => [
            'type' => Type::boolean(),
            'args' => [
                'content' => Type::nonNull(Type::string()),
            ],
            'resolve' => function($root, $args) {
                $orderModel = new Order();
                return $orderModel->createOrder($args['content']);
            },
        ],
    ],
]);

return new Schema([
    'query' => $queryType,
    'mutation' => $mutationType,
]);