import type { ReactNode } from 'react';
import React from 'react';
import { IconLoader2 } from '@tabler/icons-react';
import Center from './Center';

type Size = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | number;

export type LoadingProps = {
	className?: string;
	size?: Size;
	children?: ReactNode;
	inline?: boolean;
};

const sizeMap = {
	xsmall: 16,
	small: 24,
	medium: 32,
	large: 48,
	xlarge: 64,
};

export default function Loading(props: LoadingProps) {
	const { children, inline } = props;

	const className = `Loading ${props.className ?? ''}`;
	const size = getSize(props.size);

	const content = (
		<>
			<IconLoader2 size={size} />
			{children}
		</>
	);
	return inline ? (
		<span className={className} style={{ width: size, height: size }}>
			{content}
		</span>
	) : (
		<Center className={className}>{content}</Center>
	);
}

function getSize(size?: Size) {
	if (typeof size === 'undefined' || size === null) {
		return sizeMap.medium;
	}

	if (typeof size === 'number') {
		return size;
	}

	return sizeMap[size] ?? sizeMap.medium;
}
