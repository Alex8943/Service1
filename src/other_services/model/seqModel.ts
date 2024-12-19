import { DataTypes, Model } from "sequelize";
import sequelize from "../sequelizeConnection"; // Adjust the import path for your Sequelize connection

// User Model
export class User extends Model {
    declare id: number;
    declare name: string;
    declare lastname: string;
    declare email: string;
    declare password: string;
    declare role_fk: number;
    declare verification_key: string;
    declare createdAt: Date;
    declare updatedAt: Date;
    declare deletedAt: Date | null;
    declare verifiedAt: Date | null;
    declare isBlocked: boolean;
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role_fk: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    verification_key: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    verifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    isBlocked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    sequelize,
    modelName: 'User',
    tableName: 'user',
    timestamps: true,
    paranoid: true, // Enables soft delete
});

// Review Model
export class Review extends Model {
    declare id: number;
    declare media_fk: number;
    declare title: string;
    declare description: string;
    declare platform_fk: number;
    declare user_fk: number;
    declare createdAt: Date;
    declare deletedAt: Date | null;
    declare updatedAt: Date;
    declare isBlocked: boolean;
}

Review.init(
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        media_fk: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(750),
            allowNull: false,
        },
        platform_fk: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
        },
        user_fk: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        isBlocked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize,
        modelName: 'Review',
        tableName: 'reviews',
        timestamps: false,
        paranoid: true,
    }
);

// Genre Model
export class Genre extends Model {
    declare id: number;
    declare name: string;
}

Genre.init(
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'Genre',
        tableName: 'genre',
        timestamps: false,
        paranoid: true,
    }
);

// Media Model
export class Media extends Model {
    declare id: number;
    declare name: string;
}

Media.init(
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'Media',
        tableName: 'media',
        freezeTableName: true,
        timestamps: false,
        paranoid: true,
    }
);

// ReviewGenres Model (Junction table for many-to-many relationship between Review and Genre)
export class ReviewGenres extends Model {
    declare review_fk: number;
    declare genre_fk: number;
}

ReviewGenres.init(
    {
        review_fk: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'review', key: 'id' }, // foreign key for Review
            primaryKey: true, // Set as primary key
        },
        genre_fk: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'genre', key: 'id' }, // foreign key for Genre
            primaryKey: true, // Set as primary key
        },
    },
    {
        sequelize,
        modelName: 'ReviewGenres',
        tableName: 'review_genres',
        timestamps: false, // Disable timestamps for junction table
    }
);

// Role Model
export class Role extends Model {
    declare id: number;
    declare name: string;
}

Role.init(
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'Role',
        tableName: 'role',
        timestamps: false,
        paranoid: true,
    }
);

// ReviewActions Model (Junction table for many-to-many relationship between User and Review)
export class ReviewActions extends Model {
    declare user_fk: number;
    declare review_fk: number;
    declare review_gesture: boolean;
    declare createdAt: Date;
    declare updatedAt: Date;
}

ReviewActions.init(
    {
        user_fk: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true, // Define as part of composite primary key
            references: { model: 'user', key: 'id' }, // foreign key for User
        },
        review_fk: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true, // Define as part of composite primary key
            references: { model: 'review', key: 'id' }, // foreign key for Review
        },
        review_gesture: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'ReviewActions',
        tableName: 'review_actions',
        timestamps: false,
        paranoid: true,
    }
);

// Platform Model
export class Platform extends Model {
    declare id: number;
    declare link: string;
}

Platform.init(
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        link: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'Platform',
        tableName: 'platform',
        timestamps: false,
        paranoid: true,
    }
);

// Associations

// Role can be assigned to zero or many users
Role.hasMany(User, { foreignKey: 'role_fk' });
User.belongsTo(Role, { foreignKey: 'role_fk' });

// A user can make zero or many reviews
User.hasMany(Review, { foreignKey: 'user_fk' });
Review.belongsTo(User, { foreignKey: 'user_fk' });

// One-to-Many relationship between Media and Review
Media.hasMany(Review, { foreignKey: 'media_fk' });
Review.belongsTo(Media, { foreignKey: 'media_fk' });

// Many-to-Many relationship between Review and Genre through ReviewGenres
Review.belongsToMany(Genre, {
    through: ReviewGenres,
    foreignKey: 'review_fk', // Explicitly setting the foreign key in the review_genres table
    otherKey: 'genre_fk',    // Setting the other foreign key for genre
});

Genre.belongsToMany(Review, {
    through: ReviewGenres,
    foreignKey: 'genre_fk',  // Explicitly setting the foreign key in the review_genres table
    otherKey: 'review_fk',   // Setting the other foreign key for review
});

// One-to-Many relationship between Review and ReviewActions
ReviewActions.belongsTo(Review, { foreignKey: 'review_fk' });
Review.hasMany(ReviewActions, { foreignKey: 'review_fk' });