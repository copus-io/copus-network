#!/bin/bash

# 环境切换脚本
# 使用方法: ./scripts/switch-env.sh [development|test|staging|production]

if [ $# -eq 0 ]; then
    echo "🌍 当前环境配置:"
    echo ""
    ls -la .env*
    echo ""
    echo "📊 使用方法: ./scripts/switch-env.sh [environment]"
    echo "可选环境: development | test | staging | production"
    exit 0
fi

ENV=$1

case $ENV in
    development)
        cp .env.development .env
        echo "✅ 已切换到开发环境 (api-test.copus.network)"
        ;;
    test)
        cp .env.test .env
        echo "✅ 已切换到测试环境 (api-test.copus.network)"
        ;;
    staging)
        cp .env.staging .env
        echo "✅ 已切换到预发布环境 (api-test.copus.network)"
        ;;
    production)
        cp .env.production .env
        echo "✅ 已切换到生产环境 (api-prod.copus.network)"
        echo "⚠️  注意: 生产环境请谨慎操作！"
        ;;
    *)
        echo "❌ 无效的环境参数: $ENV"
        echo "可选环境: development | test | staging | production"
        exit 1
        ;;
esac

echo ""
echo "🔄 当前环境配置:"
cat .env
echo ""
echo "💡 重启开发服务器以应用新配置"